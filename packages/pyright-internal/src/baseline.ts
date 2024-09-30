import { DiagnosticRule } from './common/diagnosticRules';
import { FileDiagnostics } from './common/diagnosticSink';
import { Uri } from './common/uri/uri';
import { compareDiagnostics, convertLevelToCategory, Diagnostic, DiagnosticCategory } from './common/diagnostic';
import { extraOptionDiagnosticRules } from './common/configOptions';
import { fileExists } from './common/uri/uriUtils';
import { FileSystem, ReadOnlyFileSystem } from './common/fileSystem';
import { pluralize } from './common/stringUtils';
import { diffArrays } from 'diff';
import { assert } from './common/debug';
import { Range } from './common/textRange';

export interface BaselinedDiagnostic {
    code: DiagnosticRule | undefined;
    range: {
        startColumn: number;
        endColumn: number;
        /**
         * only in baseline files generated with version 1.18.1 or above. we don't store line numbers
         * to reduce the diff when the baseline is regenerated and to prevent baselined errors from
         * incorredtly resurfacing when lines of code are added or removed.
         */
        lineCount?: number;
    };
}

interface BaselineFile {
    files: {
        [filePath: string]: BaselinedDiagnostic[];
    };
}

const lineCount = (range: Range) => range.end.line - range.start.line + 1;

export const baselineFilePath = (rootDir: Uri) => rootDir.combinePaths('.basedpyright/baseline.json');

const diagnosticsToBaseline = (rootDir: Uri, filesWithDiagnostics: readonly FileDiagnostics[]): BaselineFile => {
    const baselineData: BaselineFile = {
        files: {},
    };
    for (const fileWithDiagnostics of filesWithDiagnostics) {
        const filePath = rootDir.getRelativePath(fileWithDiagnostics.fileUri)!.toString();
        const errorDiagnostics = fileWithDiagnostics.diagnostics.filter(
            (diagnostic) =>
                ![
                    DiagnosticCategory.Deprecated,
                    DiagnosticCategory.UnreachableCode,
                    DiagnosticCategory.UnusedCode,
                ].includes(diagnostic.category) || diagnostic.baselineStatus === 'baselined with hint'
        );
        if (!(filePath in baselineData.files)) {
            baselineData.files[filePath] = [];
        }
        if (!errorDiagnostics.length) {
            continue;
        }
        baselineData.files[filePath].push(
            ...errorDiagnostics.map((diagnostic) => ({
                code: diagnostic.getRule() as DiagnosticRule | undefined,
                range: {
                    startColumn: diagnostic.range.start.character,
                    endColumn: diagnostic.range.end.character,
                    lineCount: lineCount(diagnostic.range),
                },
            }))
        );
    }
    return baselineData;
};

/**
 * @param openFilesOnly whether or not we know that the diagnostics were only reported on the open files. setting this
 * to `true` prevents it from checking whether or not previously baselined files still exist, which probably makes it
 * faster
 * @returns the new contents of the baseline file
 */
export const writeDiagnosticsToBaselineFile = (
    fs: FileSystem,
    rootDir: Uri,
    filesWithDiagnostics: readonly FileDiagnostics[],
    openFilesOnly: boolean
): BaselineFile => {
    const newBaseline = diagnosticsToBaseline(rootDir, filesWithDiagnostics).files;
    const previousBaseline = getBaselinedErrors(fs, rootDir).files;
    // we don't know for sure that basedpyright was run on every file that was included when the previous baseline was
    // generated, so we check previously baselined files that aren't in the new baseline to see if they still exist. if
    // not, we assume the file was renamed or deleted and therefore its baseline entry should be removed. when
    // `openFilesOnly` is `true` we skip the file exists check to make the langusge server faster because it's very
    // likely that lots of files are missing from the new baseline.
    for (const filePath in previousBaseline) {
        if (!newBaseline[filePath] && (openFilesOnly || fileExists(fs, rootDir.combinePaths(filePath)))) {
            newBaseline[filePath] = previousBaseline[filePath];
        }
    }
    const result: BaselineFile = { files: {} };
    // sort the file names so they always show up in the same order
    // to prevent needless diffs between baseline files generated by the language server and the cli
    for (const file of Object.keys(newBaseline).sort()) {
        // remove files where there are no errors
        if (newBaseline[file].length) {
            result.files[file] = newBaseline[file];
        }
    }
    const baselineFile = baselineFilePath(rootDir);
    fs.mkdirSync(baselineFile.getDirectory(), { recursive: true });
    fs.writeFileSync(baselineFile, JSON.stringify(result, undefined, 4), null);
    return result;
};

export const getBaselineSummaryMessage = (rootDir: Uri, previousBaseline: BaselineFile, newBaseline: BaselineFile) => {
    const baselinedErrorCount = Object.values(previousBaseline.files).flatMap((file) => file).length;
    const newErrorCount = Object.values(newBaseline.files).flatMap((file) => file).length;

    const diff = newErrorCount - baselinedErrorCount;
    let message = '';
    if (diff === 0) {
        message += "error count didn't change";
    } else if (diff > 0) {
        message += `went up by ${diff}`;
    } else {
        message += `went down by ${diff * -1}`;
    }

    return `updated ${rootDir.getRelativePath(baselineFilePath(rootDir))} with ${pluralize(
        newErrorCount,
        'error'
    )} (${message})`;
};

export const getBaselinedErrors = (fs: ReadOnlyFileSystem, rootDir: Uri): BaselineFile => {
    const path = baselineFilePath(rootDir);
    let baselineFileContents;
    try {
        baselineFileContents = fs.readFileSync(path, 'utf8');
    } catch (e) {
        return { files: {} };
    }
    return JSON.parse(baselineFileContents);
};

export const getBaselinedErrorsForFile = (fs: ReadOnlyFileSystem, rootDir: Uri, file: Uri): BaselinedDiagnostic[] => {
    const relativePath = rootDir.getRelativePath(file);
    let result;
    // if this is undefined it means the file isn't in the workspace
    if (relativePath) {
        result = getBaselinedErrors(fs, rootDir).files[rootDir.getRelativePath(file)!.toString()];
    }
    return result ?? [];
};

export const sortDiagnosticsAndMatchBaseline = (
    fs: ReadOnlyFileSystem,
    rootDir: Uri,
    file: Uri,
    diagnostics: Diagnostic[]
): Diagnostic[] => {
    diagnostics.sort(compareDiagnostics);
    const diff = diffArrays(getBaselinedErrorsForFile(fs, rootDir, file), diagnostics, {
        comparator: (baselinedDiagnostic, diagnostic) =>
            baselinedDiagnostic.code === diagnostic.getRule() &&
            baselinedDiagnostic.range.startColumn === diagnostic.range.start.character &&
            baselinedDiagnostic.range.endColumn === diagnostic.range.end.character &&
            //for backwards compatibility with old baseline files, only check this if it's present
            (baselinedDiagnostic.range.lineCount === undefined ||
                baselinedDiagnostic.range.lineCount === lineCount(diagnostic.range)),
    });
    const result = [];
    for (const change of diff) {
        if (change.removed) {
            continue;
        }
        if (change.added) {
            assert(change.value[0] instanceof Diagnostic, "change object wasn't a Diagnostic");
            result.push(...(change.value as Diagnostic[]));
        } else {
            // if not added and not removed
            // if the baselined error can be reported as a hint (eg. unreachable/deprecated), keep it and change its diagnostic
            // level to that instead
            // TODO: should we only baseline errors and not warnings/notes?
            for (const diagnostic of change.value) {
                assert(
                    diagnostic instanceof Diagnostic,
                    'diff thingy returned the old value instead of the new one???'
                );
                let newDiagnostic;
                const diagnosticRule = diagnostic.getRule() as DiagnosticRule | undefined;
                if (diagnosticRule) {
                    for (const { name, get } of extraOptionDiagnosticRules) {
                        if (get().includes(diagnosticRule)) {
                            newDiagnostic = diagnostic.copy({
                                category: convertLevelToCategory(name),
                                baselineStatus: 'baselined with hint',
                            });
                            newDiagnostic.setRule(diagnosticRule);
                            // none of these rules should have multiple extra diagnostic levels so we break after the first match
                            break;
                        }
                    }
                }
                if (!newDiagnostic) {
                    newDiagnostic = diagnostic.copy({ baselineStatus: 'baselined' });
                }
                result.push(newDiagnostic);
            }
        }
    }
    return result;
};