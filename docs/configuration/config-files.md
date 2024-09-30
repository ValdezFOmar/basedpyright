## Pyright Configuration

basedpyright offers flexible configuration options specified in a JSON-formatted text configuration. By default, the file is called “pyrightconfig.json” and is located within the root directory of your project. Multi-root workspaces (“Add Folder to Workspace…”) are supported, and each workspace root can have its own “pyrightconfig.json” file. For a sample pyrightconfig.json file, see [below](../configuration/config-files.md#sample-config-file).

basedpyright settings can also be specified in a `[tool.basedpyright]` section of a “pyproject.toml” file. A “pyrightconfig.json” file always takes precedent over “pyproject.toml” if both are present. For a sample pyproject.toml file, see [below](../configuration/config-files.md#sample-pyprojecttoml-file).

!!! info

    the `[tool.pyright]` section in `pyproject.toml` is also supported for backwards compatibility with existing pyright configs.

Relative paths specified within the config file are relative to the config file’s location. Paths with shell variables (including `~`) are not supported. Paths within a config file should generally be relative paths so the config file can be shared by other developers who contribute to the project.

## Environment Options

The following settings control the *environment* in which basedpyright will check for diagnostics. These settings determine how Pyright finds source files, imports, and what Python version specific rules are applied.

- **include** [array of paths, optional]: Paths of directories or files that should be considered part of the project. If no paths are specified, pyright defaults to the directory that contains the config file. Paths may contain wildcard characters ** (a directory or multiple levels of directories), * (a sequence of zero or more characters), or ? (a single character). If no include paths are specified, the root path for the workspace is assumed.

- **exclude** [array of paths, optional]: Paths of directories or files that should not be considered part of the project. These override the directories and files that `include` matched, allowing specific subdirectories to be excluded. Note that files in the exclude paths may still be included in the analysis if they are referenced (imported) by source files that are not excluded. Paths may contain wildcard characters ** (a directory or multiple levels of directories), * (a sequence of zero or more characters), or ? (a single character). If no exclude paths are specified, Pyright automatically excludes the following: `**/node_modules`, `**/__pycache__`, `**/.*`. Pylance also excludes any virtual environment directories regardless of the exclude paths specified. For more detail on Python environment specification and discovery, refer to the [import resolution](../usage/import-resolution.md#configuring-your-python-environment) documentation.

- **strict** [array of paths, optional]: Paths of directories or files that should use “strict” analysis if they are included. This is the same as manually adding a “# pyright: strict” comment. In strict mode, most type-checking rules are enabled. Refer to [this table](#diagnostic-settings-defaults) for details about which rules are enabled in strict mode. Paths may contain wildcard characters ** (a directory or multiple levels of directories), * (a sequence of zero or more characters), or ? (a single character).

- **extends** [path, optional]: Path to another `.json` or `.toml` file that is used as a “base configuration”, allowing this configuration to inherit configuration settings. Top-level keys within this configuration overwrite top-level keys in the base configuration. Multiple levels of inheritance are supported. Relative paths specified in a configuration file are resolved relative to the location of that configuration file.

- **defineConstant** [map of constants to values (boolean or string), optional]: Set of identifiers that should be assumed to contain a constant value wherever used within this program. For example, `{ "DEBUG": true }` indicates that pyright should assume that the identifier `DEBUG` will always be equal to `True`. If this identifier is used within a conditional expression (such as `if not DEBUG:`) pyright will use the indicated value to determine whether the guarded block is reachable or not. Member expressions that reference one of these constants (e.g. `my_module.DEBUG`) are also supported.

- **typeshedPath** [path, optional]: Path to a directory that contains typeshed type stub files. Pyright ships with a bundled copy of typeshed type stubs. If you want to use a different version of typeshed stubs, you can clone the [typeshed github repo](https://github.com/python/typeshed) to a local directory and reference the location with this path. This option is useful if you’re actively contributing updates to typeshed.

- **stubPath** [path, optional]: Path to a directory that contains custom type stubs. Each package's type stub file(s) are expected to be in its own subdirectory. The default value of this setting is "./typings". (typingsPath is now deprecated)

- **venvPath** [path, optional]: Path to a directory containing one or more subdirectories, each of which contains a virtual environment. When used in conjunction with a **venv** setting (see below), pyright will search for imports in the virtual environment’s site-packages directory rather than the paths specified by the default Python interpreter. If you are working on a project with other developers, it is best not to specify this setting in the config file, since this path will typically differ for each developer. Instead, it can be specified on the command line or in a per-user setting. For more details, refer to the [import resolution](../usage/import-resolution.md#configuring-your-python-environment) documentation. This setting is ignored when using Pylance. VS Code's python interpreter path is used instead.

- **venv** [string, optional]: Used in conjunction with the venvPath, specifies the virtual environment to use. For more details, refer to the [import resolution](../usage/import-resolution.md#configuring-your-python-environment) documentation. This setting is ignored when using Pylance.

- **verboseOutput** [boolean]: Specifies whether output logs should be verbose. This is useful when diagnosing certain problems like import resolution issues.

- **extraPaths** [array of strings, optional]: Additional search paths that will be used when searching for modules imported by files.

- **pythonVersion** [string, optional]: Specifies the version of Python that will be used to execute the source code. The version should be specified as a string in the format "M.m" where M is the major version and m is the minor (e.g. `"3.0"` or `"3.6"`). If a version is provided, pyright will generate errors if the source code makes use of language features that are not supported in that version. It will also tailor its use of type stub files, which conditionalizes type definitions based on the version. If no version is specified, pyright will use the version of the current python interpreter, if one is present.

- **pythonPlatform** [string, optional]: Specifies the target platform that will be used to execute the source code. Should be one of `"Windows"`, `"Darwin"`, `"Linux"`, or `"All"`. If specified, pyright will tailor its use of type stub files, which conditionalize type definitions based on the platform. If no platform is specified, pyright will use the current platform.

- **executionEnvironments** [array of objects, optional]: Specifies a list of execution environments (see [below](config-files.md#execution-environment-options)). Execution environments are searched from start to finish by comparing the path of a source file with the root path specified in the execution environment.

- **useLibraryCodeForTypes** [boolean]: Determines whether pyright reads, parses and analyzes library code to extract type information in the absence of type stub files. Type information will typically be incomplete. We recommend using type stubs where possible. The default value for this option is true.

## Type Evaluation Settings

The following settings determine how different types should be evaluated.

- <a name="strictListInference"></a> **strictListInference** [boolean]: When inferring the type of a list, use strict type assumptions. For example, the expression `[1, 'a', 3.4]` could be inferred to be of type `list[Any]` or `list[int | str | float]`. If this setting is true, it will use the latter (stricter) type. The default value for this setting is `false`.

- <a name="strictListInference"></a> **strictListInference** [boolean]: When inferring the type of a list, use strict type assumptions. For example, the expression `[1, 'a', 3.4]` could be inferred to be of type `list[Any]` or `list[int | str | float]`. If this setting is true, it will use the latter (stricter) type.

- <a name="strictDictionaryInference"></a> **strictDictionaryInference** [boolean]: When inferring the type of a dictionary’s keys and values, use strict type assumptions. For example, the expression `{'a': 1, 'b': 'a'}` could be inferred to be of type `dict[str, Any]` or `dict[str, int | str]`. If this setting is true, it will use the latter (stricter) type.

- <a name="strictSetInference"></a> **strictSetInference** [boolean]: When inferring the type of a set, use strict type assumptions. For example, the expression `{1, 'a', 3.4}` could be inferred to be of type `set[Any]` or `set[int | str | float]`. If this setting is true, it will use the latter (stricter) type.

- <a name="analyzeUnannotatedFunctions"></a> **analyzeUnannotatedFunctions** [boolean]: Analyze and report errors for functions and methods that have no type annotations for input parameters or return types.

- <a name="strictParameterNoneValue"></a> **strictParameterNoneValue** [boolean]: PEP 484 indicates that when a function parameter is assigned a default value of None, its type should implicitly be Optional even if the explicit type is not. When enabled, this rule requires that parameter type annotations use Optional explicitly in this case.

- <a name="deprecateTypingAliases"></a> **deprecateTypingAliases** [boolean]: PEP 585 indicates that aliases to types in standard collections that were introduced solely to support generics are deprecated as of Python 3.9. This switch controls whether these are treated as deprecated. This applies only when pythonVersion is 3.9 or newer.

- <a name="enableExperimentalFeatures"></a> **enableExperimentalFeatures** [boolean]: Enables a set of experimental (mostly undocumented) features that correspond to proposed or exploratory changes to the Python typing standard. These features will likely change or be removed, so they should not be used except for experimentation purposes.

- <a name="disableBytesTypePromotions"></a> **disableBytesTypePromotions** [boolean]: Disables legacy behavior where `bytearray` and `memoryview` are considered subtypes of `bytes`. [PEP 688](https://peps.python.org/pep-0688/#no-special-meaning-for-bytes) deprecates this behavior, but this switch is provided to restore the older behavior.

## Type Check Diagnostics Settings
The following settings control pyright’s diagnostic output (warnings or errors).

- **typeCheckingMode** ["off", "basic", "standard", "strict", "all"]: Specifies the default rule set to use. Some rules can be overridden using additional configuration flags documented below. The default value for this setting is "all". If set to "off", all type-checking rules are disabled, but Python syntax and semantic errors are still reported.

- **ignore** [array of paths, optional]: Paths of directories or files whose diagnostic output (errors and warnings) should be suppressed even if they are an included file or within the transitive closure of an included file. Paths may contain wildcard characters ** (a directory or multiple levels of directories), * (a sequence of zero or more characters), or ? (a single character). This setting can be overridden in VS code in your settings.json.

### Type Check Rule Overrides

The following settings allow more fine grained control over the **typeCheckingMode**. Unless otherwise specified, each diagnostic setting can specify a boolean value (`false` indicating that no error is generated and `true` indicating that an error is generated). Alternatively, a string value of `"none"`, `"warning"`, `"information"`, or `"error"` can be used to specify the diagnostic level.

- <a name="reportGeneralTypeIssues"></a> **reportGeneralTypeIssues** [boolean or string, optional]: Generate or suppress diagnostics for general type inconsistencies, unsupported operations, argument/parameter mismatches, etc. This covers all of the basic type-checking rules not covered by other rules. It does not include syntax errors.

- <a name="reportPropertyTypeMismatch"></a> **reportPropertyTypeMismatch** [boolean or string, optional]: Generate or suppress diagnostics for properties where the type of the value passed to the setter is not assignable to the value returned by the getter. Such mismatches violate the intended use of properties, which are meant to act like variables.

- <a name="reportFunctionMemberAccess"></a> **reportFunctionMemberAccess** [boolean or string, optional]: Generate or suppress diagnostics for non-standard member accesses for functions.

- <a name="reportMissingImports"></a> **reportMissingImports** [boolean or string, optional]: Generate or suppress diagnostics for imports that have no corresponding imported python file or type stub file.

- <a name="reportMissingModuleSource"></a> **reportMissingModuleSource** [boolean or string, optional]: Generate or suppress diagnostics for imports that have no corresponding source file. This happens when a type stub is found, but the module source file was not found, indicating that the code may fail at runtime when using this execution environment. Type checking will be done using the type stub.

- <a name="reportInvalidTypeForm"></a> **reportInvalidTypeForm** [boolean or string, optional]: Generate or suppress diagnostics for type annotations that use invalid type expression forms or are semantically invalid.

- <a name="reportMissingTypeStubs"></a> **reportMissingTypeStubs** [boolean or string, optional]: Generate or suppress diagnostics for imports that have no corresponding type stub file (either a typeshed file or a custom type stub). The type checker requires type stubs to do its best job at analysis.

- <a name="reportImportCycles"></a> **reportImportCycles** [boolean or string, optional]: Generate or suppress diagnostics for cyclical import chains. These are not errors in Python, but they do slow down type analysis and often hint at architectural layering issues. Generally, they should be avoided.

- <a name="reportUnusedImport"></a> **reportUnusedImport** [boolean or string, optional]: Generate or suppress diagnostics for an imported symbol that is not referenced within that file.

- <a name="reportUnusedClass"></a> **reportUnusedClass** [boolean or string, optional]: Generate or suppress diagnostics for a class with a private name (starting with an underscore) that is not accessed.

- <a name="reportUnusedFunction"></a> **reportUnusedFunction** [boolean or string, optional]: Generate or suppress diagnostics for a function or method with a private name (starting with an underscore) that is not accessed.

- <a name="reportUnusedVariable"></a> **reportUnusedVariable** [boolean or string, optional]: Generate or suppress diagnostics for a variable that is not accessed.

- <a name="reportDuplicateImport"></a> **reportDuplicateImport** [boolean or string, optional]: Generate or suppress diagnostics for an imported symbol or module that is imported more than once.

- <a name="reportWildcardImportFromLibrary"></a> **reportWildcardImportFromLibrary** [boolean or string, optional]: Generate or suppress diagnostics for a wildcard import from an external library. The use of this language feature is highly discouraged and can result in bugs when the library is updated.

- <a name="reportAbstractUsage"></a> **reportAbstractUsage** [boolean or string, optional]: Generate or suppress diagnostics for the attempted instantiate an abstract or protocol class or use of an abstract method.

- <a name="reportArgumentType"></a> **reportArgumentType** [boolean or string, optional]: Generate or suppress diagnostics for argument type incompatibilities when evaluating a call expression.

- <a name="reportAssertTypeFailure"></a> **reportAssertTypeFailure** [boolean or string, optional]: Generate or suppress diagnostics for a type mismatch detected by the `typing.assert_type` call.

- <a name="reportAssignmentType"></a> **reportAssignmentType** [boolean or string, optional]: Generate or suppress diagnostics for assignment type incompatibility.

- <a name="reportAttributeAccessIssue"></a> **reportAttributeAccessIssue** [boolean or string, optional]: Generate or suppress diagnostics related to attribute accesses.

- <a name="reportCallIssue"></a> **reportCallIssue** [boolean or string, optional]: Generate or suppress diagnostics related to call expressions and arguments passed to a call target.

- <a name="reportInconsistentOverload"></a> **reportInconsistentOverload** [boolean or string, optional]: Generate or suppress diagnostics for an overloaded function that has overload signatures that are inconsistent with each other or with the implementation.

- <a name="reportIndexIssue"></a> **reportIndexIssue** [boolean or string, optional]: Generate or suppress diagnostics related to index operations and expressions.

- <a name="reportInvalidTypeArguments"></a> **reportInvalidTypeArguments** [boolean or string, optional]: Generate or suppress diagnostics for invalid type argument usage.

- <a name="reportNoOverloadImplementation"></a> **reportNoOverloadImplementation** [boolean or string, optional]: Generate or suppress diagnostics for an overloaded function or method if the implementation is not provided.

- <a name="reportOperatorIssue"></a> **reportOperatorIssue** [boolean or string, optional]: Generate or suppress diagnostics related to the use of unary or binary operators (like `*` or `not`).

- <a name="reportOptionalSubscript"></a> **reportOptionalSubscript** [boolean or string, optional]: Generate or suppress diagnostics for an attempt to subscript (index) a variable with an Optional type.

- <a name="reportOptionalMemberAccess"></a> **reportOptionalMemberAccess** [boolean or string, optional]: Generate or suppress diagnostics for an attempt to access a member of a variable with an Optional type.

- <a name="reportOptionalCall"></a> **reportOptionalCall** [boolean or string, optional]: Generate or suppress diagnostics for an attempt to call a variable with an Optional type.

- <a name="reportOptionalIterable"></a> **reportOptionalIterable** [boolean or string, optional]: Generate or suppress diagnostics for an attempt to use an Optional type as an iterable value (e.g. within a `for` statement).

- <a name="reportOptionalContextManager"></a> **reportOptionalContextManager** [boolean or string, optional]: Generate or suppress diagnostics for an attempt to use an Optional type as a context manager (as a parameter to a `with` statement).

- <a name="reportOptionalOperand"></a> **reportOptionalOperand** [boolean or string, optional]: Generate or suppress diagnostics for an attempt to use an Optional type as an operand to a unary operator (like `~` or `not`) or the left-hand operator of a binary operator (like `*`, `==`, `or`).

- <a name="reportRedeclaration"></a> **reportRedeclaration** [boolean or string, optional]: Generate or suppress diagnostics for a symbol that has more than one type declaration.

- <a name="reportReturnType"></a> **reportReturnType** [boolean or string, optional]: Generate or suppress diagnostics related to function return type compatibility.

- <a name="reportTypedDictNotRequiredAccess"></a> **reportTypedDictNotRequiredAccess** [boolean or string, optional]: Generate or suppress diagnostics for an attempt to access a non-required field within a TypedDict without first checking whether it is present.

- <a name="reportUntypedFunctionDecorator"></a> **reportUntypedFunctionDecorator** [boolean or string, optional]: Generate or suppress diagnostics for function decorators that have no type annotations. These obscure the function type, defeating many type analysis features.

- <a name="reportUntypedClassDecorator"></a> **reportUntypedClassDecorator** [boolean or string, optional]: Generate or suppress diagnostics for class decorators that have no type annotations. These obscure the class type, defeating many type analysis features.

- <a name="reportUntypedBaseClass"></a> **reportUntypedBaseClass** [boolean or string, optional]: Generate or suppress diagnostics for base classes whose type cannot be determined statically. These obscure the class type, defeating many type analysis features.

- <a name="reportUntypedNamedTuple"></a> **reportUntypedNamedTuple** [boolean or string, optional]: Generate or suppress diagnostics when “namedtuple” is used rather than “NamedTuple”. The former contains no type information, whereas the latter does.

- <a name="reportPrivateUsage"></a> **reportPrivateUsage** [boolean or string, optional]: Generate or suppress diagnostics for incorrect usage of private or protected variables or functions. Protected class members begin with a single underscore (“_”) and can be accessed only by subclasses. Private class members begin with a double underscore but do not end in a double underscore and can be accessed only within the declaring class. Variables and functions declared outside of a class are considered private if their names start with either a single or double underscore, and they cannot be accessed outside of the declaring module.

- <a name="reportTypeCommentUsage"></a> **reportTypeCommentUsage** [boolean or string, optional]: Prior to Python 3.5, the grammar did not support type annotations, so types needed to be specified using “type comments”. Python 3.5 eliminated the need for function type comments, and Python 3.6 eliminated the need for variable type comments. Future versions of Python will likely deprecate all support for type comments. If enabled, this check will flag any type comment usage unless it is required for compatibility with the specified language version.

- <a name="reportPrivateImportUsage"></a> **reportPrivateImportUsage** [boolean or string, optional]: Generate or suppress diagnostics for use of a symbol from a third party "py.typed" module that is not meant to be exported from that module.

- <a name="reportConstantRedefinition"></a> **reportConstantRedefinition** [boolean or string, optional]: Generate or suppress diagnostics for attempts to redefine variables whose names are all-caps with underscores and numerals.

- <a name="reportDeprecated"></a> **reportDeprecated** [boolean or string, optional]: Generate or suppress diagnostics for use of a class or function that has been marked as deprecated.

- <a name="reportIncompatibleMethodOverride"></a> **reportIncompatibleMethodOverride** [boolean or string, optional]: Generate or suppress diagnostics for methods that override a method of the same name in a base class in an incompatible manner (wrong number of parameters, incompatible parameter types, or incompatible return type).

- <a name="reportIncompatibleVariableOverride"></a> **reportIncompatibleVariableOverride** [boolean or string, optional]: Generate or suppress diagnostics for class variable declarations that override a symbol of the same name in a base class with a type that is incompatible with the base class symbol type.

- <a name="reportInconsistentConstructor"></a> **reportInconsistentConstructor** [boolean or string, optional]: Generate or suppress diagnostics when an `__init__` method signature is inconsistent with a `__new__` signature.

- <a name="reportOverlappingOverload"></a> **reportOverlappingOverload** [boolean or string, optional]: Generate or suppress diagnostics for function overloads that overlap in signature and obscure each other or have incompatible return types.

- <a name="reportPossiblyUnboundVariable"></a> **reportPossiblyUnboundVariable** [boolean or string, optional]: Generate or suppress diagnostics for variables that are possibly unbound on some code paths.

- <a name="reportMissingSuperCall"></a> **reportMissingSuperCall** [boolean or string, optional]: Generate or suppress diagnostics for `__init__`, `__init_subclass__`, `__enter__` and `__exit__` methods in a subclass that fail to call through to the same-named method on a base class.

- <a name="reportUninitializedInstanceVariable"></a> **reportUninitializedInstanceVariable** [boolean or string, optional]: Generate or suppress diagnostics for instance variables within a class that are not initialized or declared within the class body or the `__init__` method.

- <a name="reportInvalidStringEscapeSequence"></a> **reportInvalidStringEscapeSequence** [boolean or string, optional]: Generate or suppress diagnostics for invalid escape sequences used within string literals. The Python specification indicates that such sequences will generate a syntax error in future versions.

- <a name="reportUnknownParameterType"></a> **reportUnknownParameterType** [boolean or string, optional]: Generate or suppress diagnostics for input or return parameters for functions or methods that have an unknown type.

- <a name="reportUnknownArgumentType"></a> **reportUnknownArgumentType** [boolean or string, optional]: Generate or suppress diagnostics for call arguments for functions or methods that have an unknown type.

- <a name="reportUnknownLambdaType"></a> **reportUnknownLambdaType** [boolean or string, optional]: Generate or suppress diagnostics for input or return parameters for lambdas that have an unknown type.

- <a name="reportUnknownVariableType"></a> **reportUnknownVariableType** [boolean or string, optional]: Generate or suppress diagnostics for variables that have an unknown type.

- <a name="reportUnknownMemberType"></a> **reportUnknownMemberType** [boolean or string, optional]: Generate or suppress diagnostics for class or instance variables that have an unknown type.

- <a name="reportMissingParameterType"></a> **reportMissingParameterType** [boolean or string, optional]: Generate or suppress diagnostics for input parameters for functions or methods that are missing a type annotation. The `self` and `cls` parameters used within methods are exempt from this check.

- <a name="reportMissingTypeArgument"></a> **reportMissingTypeArgument** [boolean or string, optional]: Generate or suppress diagnostics when a generic class is used without providing explicit or implicit type arguments.

- <a name="reportInvalidTypeVarUse"></a> **reportInvalidTypeVarUse** [boolean or string, optional]: Generate or suppress diagnostics when a TypeVar is used inappropriately (e.g. if a TypeVar appears only once) within a generic function signature.

- <a name="reportCallInDefaultInitializer"></a> **reportCallInDefaultInitializer** [boolean or string, optional]: Generate or suppress diagnostics for function calls, list expressions, set expressions, or dictionary expressions within a default value initialization expression. Such calls can mask expensive operations that are performed at module initialization time.

- <a name="reportUnnecessaryIsInstance"></a> **reportUnnecessaryIsInstance** [boolean or string, optional]: Generate or suppress diagnostics for `isinstance` or `issubclass` calls where the result is statically determined to be always true or always false. Such calls are often indicative of a programming error.

- <a name="reportUnnecessaryCast"></a> **reportUnnecessaryCast** [boolean or string, optional]: Generate or suppress diagnostics for `cast` calls that are statically determined to be unnecessary. Such calls are sometimes indicative of a programming error.

- <a name="reportUnnecessaryComparison"></a> **reportUnnecessaryComparison** [boolean or string, optional]: Generate or suppress diagnostics for `==` or `!=` comparisons or other conditional expressions that are statically determined to always evaluate to False or True. Such comparisons are sometimes indicative of a programming error.

- <a name="reportUnnecessaryContains"></a> **reportUnnecessaryContains** [boolean or string, optional]: Generate or suppress diagnostics for `in` operations that are statically determined to always evaluate to False or True. Such operations are sometimes indicative of a programming error.

- <a name="reportAssertAlwaysTrue"></a> **reportAssertAlwaysTrue** [boolean or string, optional]: Generate or suppress diagnostics for `assert` statement that will provably always assert because its first argument is a parenthesized tuple (for example, `assert (v > 0, "Bad value")` when the intent was probably `assert v > 0, "Bad value"`). This is a common programming error.

- <a name="reportSelfClsParameterName"></a> **reportSelfClsParameterName** [boolean or string, optional]: Generate or suppress diagnostics for a missing or misnamed “self” parameter in instance methods and “cls” parameter in class methods. Instance methods in metaclasses (classes that derive from “type”) are allowed to use “cls” for instance methods.

- <a name="reportImplicitStringConcatenation"></a> **reportImplicitStringConcatenation** [boolean or string, optional]: Generate or suppress diagnostics for two or more string literals that follow each other, indicating an implicit concatenation. This is considered a bad practice and often masks bugs such as missing commas.

- <a name="reportUndefinedVariable"></a> **reportUndefinedVariable** [boolean or string, optional]: Generate or suppress diagnostics for undefined variables.

- <a name="reportUnboundVariable"></a> **reportUnboundVariable** [boolean or string, optional]: Generate or suppress diagnostics for unbound variables.

- <a name="reportUnhashable"></a> **reportUnhashable** [boolean or string, optional]: Generate or suppress diagnostics for the use of an unhashable object in a container that requires hashability. The default value for this setting is `"error"`.

- <a name="reportInvalidStubStatement"></a> **reportInvalidStubStatement** [boolean or string, optional]: Generate or suppress diagnostics for statements that are syntactically correct but have no purpose within a type stub file.

- <a name="reportIncompleteStub"></a> **reportIncompleteStub** [boolean or string, optional]: Generate or suppress diagnostics for a module-level `__getattr__` call in a type stub file, indicating that it is incomplete.

- <a name="reportUnsupportedDunderAll"></a> **reportUnsupportedDunderAll** [boolean or string, optional]: Generate or suppress diagnostics for statements that define or manipulate `__all__` in a way that is not allowed by a static type checker, thus rendering the contents of `__all__` to be unknown or incorrect. Also reports names within the `__all__` list that are not present in the module namespace.

- <a name="reportUnusedCallResult"></a> **reportUnusedCallResult** [boolean or string, optional]: Generate or suppress diagnostics for call statements whose return value is not used in any way and is not None.

- <a name="reportUnusedCoroutine"></a> **reportUnusedCoroutine** [boolean or string, optional]: Generate or suppress diagnostics for call statements whose return value is not used in any way and is a Coroutine. This identifies a common error where an `await` keyword is mistakenly omitted.

- <a name="reportUnusedExcept"></a> **reportUnusedExcept** [boolean or string, optional]: Generate or suppress diagnostics for an `except` clause that will never be reached.

- <a name="reportUnusedExpression"></a> **reportUnusedExpression** [boolean or string, optional]: Generate or suppress diagnostics for simple expressions whose results are not used in any way.

- <a name="reportUnnecessaryTypeIgnoreComment"></a> **reportUnnecessaryTypeIgnoreComment** [boolean or string, optional]: Generate or suppress diagnostics for a `# type: ignore` or `# pyright: ignore` comment that would have no effect if removed.

- <a name="reportMatchNotExhaustive"></a> **reportMatchNotExhaustive** [boolean or string, optional]: Generate or suppress diagnostics for a `match` statement that does not provide cases that exhaustively match against all potential types of the target expression.

- <a name="reportImplicitOverride"></a> **reportImplicitOverride** [boolean or string, optional]: Generate or suppress diagnostics for overridden methods in a class that are missing an explicit `@override` decorator.

- <a name="reportShadowedImports"></a> **reportShadowedImports** [boolean or string, optional]: Generate or suppress diagnostics for files that are overriding a module in the stdlib.

## Based options

the following additional options are not available in regular pyright:

- <a name="reportUnreachable"></a> **reportUnreachable** [boolean or string, optional]: Generate or suppress diagnostics for unreachable code.

- <a name="reportAny"></a> **reportAny** [boolean or string, optional]: Ban all usages of the `Any` type. this accounts for all scenarios not covered by the `reportUnknown*` rules (since "Unknown" isn't a real type, but a distinction pyright makes to disallow the `Any` type only in certain circumstances).

- <a name="reportIgnoreCommentWithoutRule"></a> **reportIgnoreCommentWithoutRule** [boolean or string, optional]: Enforce that all `# type:ignore`/`# pyright:ignore` comments specify a rule in brackets (eg. `# pyright:ignore[reportAny]`)

- <a name="reportPrivateLocalImportUsage"></a> **reportPrivateLocalImportUsage** [boolean or string, optional]: Generate or suppress diagnostics for use of a symbol from a local module that is not meant to be exported from that module. Like `reportPrivateImportUsage` but also checks imports from your own code.

- <a name="reportImplicitRelativeImport"></a> **reportImplicitRelativeImport** [boolean or string, optional]: Generate or suppress diagnostics for non-relative imports that do not specify the full path to the module.

- <a name="reportInvalidCast"></a> **reportInvalidCast** [boolean or string, optional]: Generate or suppress diagnostics for `cast`s to non-overlapping types.

- <a name="reportUnsafeMultipleInheritance"></a> **reportUnsafeMultipleInheritance** [boolean or string, optional]: Generate or suppress diagnostics for classes that inherit from multiple base classes with an `__init__` or `__new__` method, which is unsafe because those additional constructors may either never get called or get called with invalid arguments.

- <a name="reportUnusedParameter"></a> **reportUnusedParameter** [boolean or string, optional]: Generate or suppress diagnostics for unused function parameters.

## Discouraged options

there are rules in pyright that are discouraged in basedpyright because we provide a better alternative. these options are still available for backwards compatibility, but you shouldn't use them.

- <a name="enableTypeIgnoreComments"></a> **enableTypeIgnoreComments** [boolean]: PEP 484 defines support for `# type: ignore` comments. This switch enables or disables support for these comments. This option is discouraged in favor of `# pyright: ignore` comments in basedpyright, as they are safer. [See here](../benefits-over-pyright/new-diagnostic-rules.md#reportignorecommentwithoutrule) for more information.

- <a name="enableReachabilityAnalysis"></a> **enableReachabilityAnalysis** [boolean]: If enabled, code that is determined to be unreachable by type analysis is reported using a tagged hint. This setting does not affect code that is determined to be unreachable regardless of type analysis; such code is always reported as unreachable. This setting also has no effect when when using the command-line version of pyright because it never emits tagged hints for unreachable code. this rule is discouraged in basedpyright in favor of [`reportUnreachable`](../benefits-over-pyright/new-diagnostic-rules.md#reportunreachable).

## Execution Environment Options
Pyright allows multiple “execution environments” to be defined for different portions of your source tree. For example, a subtree may be designed to run with different import search paths or a different version of the python interpreter than the rest of the source base.

The following settings can be specified for each execution environment. Each source file within a project is associated with at most one execution environment -- the first one whose root directory contains that file.

- **root** [string, required]: Root path for the code that will execute within this execution environment.

- **extraPaths** [array of strings, optional]: Additional search paths (in addition to the root path) that will be used when searching for modules imported by files within this execution environment. If specified, this overrides the default extraPaths setting when resolving imports for files within this execution environment. Note that each file’s execution environment mapping is independent, so if file A is in one execution environment and imports a second file B within a second execution environment, any imports from B will use the extraPaths in the second execution environment.

- **pythonVersion** [string, optional]: The version of Python used for this execution environment. If not specified, the global `pythonVersion` setting is used instead.

- **pythonPlatform** [string, optional]: Specifies the target platform that will be used for this execution environment. If not specified, the global `pythonPlatform` setting is used instead.

In addition, any of the [type check diagnostics settings](config-files.md#type-check-diagnostics-settings) listed above can be specified. These settings act as overrides for the files in this execution environment.

## Sample Config File
The following is an example of a pyright config file:
```json
{
  "include": [
    "src"
  ],

  "exclude": [
    "**/node_modules",
    "**/__pycache__",
    "src/experimental",
    "src/typestubs"
  ],

  "ignore": [
    "src/oldstuff"
  ],

  "defineConstant": {
    "DEBUG": true
  },

  "stubPath": "src/stubs",

  "reportMissingImports": "error",
  "reportMissingTypeStubs": false,

  "pythonVersion": "3.6",
  "pythonPlatform": "Linux",

  "executionEnvironments": [
    {
      "root": "src/web",
      "pythonVersion": "3.5",
      "pythonPlatform": "Windows",
      "extraPaths": [
        "src/service_libs"
      ],
      "reportMissingImports": "warning"
    },
    {
      "root": "src/sdk",
      "pythonVersion": "3.0",
      "extraPaths": [
        "src/backend"
      ]
    },
    {
      "root": "src/tests",
      "reportPrivateUsage": false,
      "extraPaths": [
        "src/tests/e2e",
        "src/sdk"
      ]
    },
    {
      "root": "src"
    }
  ]
}
```

## Sample pyproject.toml File
```toml
[tool.basedpyright]
include = ["src"]
exclude = ["**/node_modules",
    "**/__pycache__",
    "src/experimental",
    "src/typestubs"
]
ignore = ["src/oldstuff"]
defineConstant = { DEBUG = true }
stubPath = "src/stubs"

reportMissingImports = "error"
reportMissingTypeStubs = false

pythonVersion = "3.6"
pythonPlatform = "Linux"

executionEnvironments = [
  { root = "src/web", pythonVersion = "3.5", pythonPlatform = "Windows", extraPaths = [ "src/service_libs" ], reportMissingImports = "warning" },
  { root = "src/sdk", pythonVersion = "3.0", extraPaths = [ "src/backend" ] },
  { root = "src/tests", reportPrivateUsage = false, extraPaths = ["src/tests/e2e", "src/sdk" ]},
  { root = "src" }
]
```

## Diagnostic Settings Defaults

Each diagnostic setting has a default that is dictated by the specified type checking mode. The default for each rule can be overridden in the configuration file or settings. In strict type checking mode, overrides may only increase the strictness (e.g. increase the severity level from `"warning"` to `"error"`).

Some rules have an additional severity level such as `"unused"`, `"deprecated"` or `"unreachable"`. These are only used by the language server so that your editor can grey out or add a strikethrough to the symbol, which you can disable by setting it to `"off"`. it does not effect the outcome when running basedpyright via the CLI, so in that context these severity levels essentially mean the same thing as `"off"`.

The following table lists the default severity levels for each diagnostic rule within each type checking mode (`"off"`, `"basic"`, `"standard"`, `"strict"` and `"all"`).

note that some settings which are enabled by default in pyright are disabled by default in basedpyright (even though the default `typeCheckingMode` is `"all"`). this is because these rules are discouraged, but in the interest of backwards compatibility with pyright, they remain available to any users who still want to use them.

| Diagnostic Rule                          | Off           | Basic         | Standard      | Strict        | All     |
|:-----------------------------------------|:--------------|:--------------|:--------------|:--------------|:--------|
| analyzeUnannotatedFunctions              | true          | true          | true          | true          | true    |
| disableBytesTypePromotions               | true          | true          | true          | true          | true    |
| strictParameterNoneValue                 | false         | true          | true          | true          | true    |
| enableTypeIgnoreComments                 | true          | true          | true          | true          | false   |
| enableReachabilityAnalysis               | false         | true          | true          | true          | true    |
| strictListInference                      | false         | false         | false         | true          | true    |
| strictDictionaryInference                | false         | false         | false         | true          | true    |
| strictSetInference                       | false         | false         | false         | true          | true    |
| deprecateTypingAliases                   | false         | false         | false         | false         | true    |
| enableExperimentalFeatures               | false         | false         | false         | false         | true    |
| reportMissingModuleSource                | "none"        | "warning"     | "warning"     | "warning"     | "error" |
| reportInvalidTypeForm                    | "none"        | "error"       | "error"       | "error"       | "error" |
| reportMissingImports                     | "none"        | "error"       | "error"       | "error"       | "error" |
| reportUndefinedVariable                  | "none"        | "error"       | "error"       | "error"       | "error" |
| reportAssertAlwaysTrue                   | "none"        | "warning"     | "warning"     | "error"       | "error" |
| reportInvalidStringEscapeSequence        | "none"        | "warning"     | "warning"     | "error"       | "error" |
| reportInvalidTypeVarUse                  | "none"        | "warning"     | "warning"     | "error"       | "error" |
| reportMissingTypeStubs                   | "none"        | "none"        | "none"        | "error"       | "error" |
| reportSelfClsParameterName               | "none"        | "warning"     | "warning"     | "error"       | "error" |
| reportUnsupportedDunderAll               | "none"        | "warning"     | "warning"     | "error"       | "error" |
| reportUnusedExpression                   | "none"        | "warning"     | "warning"     | "error"       | "error" |
| reportWildcardImportFromLibrary          | "none"        | "warning"     | "warning"     | "error"       | "error" |
| reportAbstractUsage                      | "none"        | "error"       | "error"       | "error"       | "error" |
| reportArgumentType                       | "none"        | "error"       | "error"       | "error"       | "error" |
| reportAssertTypeFailure                  | "none"        | "error"       | "error"       | "error"       | "error" |
| reportAssignmentType                     | "none"        | "error"       | "error"       | "error"       | "error" |
| reportAttributeAccessIssue               | "none"        | "error"       | "error"       | "error"       | "error" |
| reportCallIssue                          | "none"        | "error"       | "error"       | "error"       | "error" |
| reportGeneralTypeIssues                  | "none"        | "error"       | "error"       | "error"       | "error" |
| reportInconsistentOverload               | "none"        | "error"       | "error"       | "error"       | "error" |
| reportIndexIssue                         | "none"        | "error"       | "error"       | "error"       | "error" |
| reportInvalidTypeArguments               | "none"        | "error"       | "error"       | "error"       | "error" |
| reportNoOverloadImplementation           | "none"        | "error"       | "error"       | "error"       | "error" |
| reportOperatorIssue                      | "none"        | "error"       | "error"       | "error"       | "error" |
| reportOptionalSubscript                  | "none"        | "error"       | "error"       | "error"       | "error" |
| reportOptionalMemberAccess               | "none"        | "error"       | "error"       | "error"       | "error" |
| reportOptionalCall                       | "none"        | "error"       | "error"       | "error"       | "error" |
| reportOptionalIterable                   | "none"        | "error"       | "error"       | "error"       | "error" |
| reportOptionalContextManager             | "none"        | "error"       | "error"       | "error"       | "error" |
| reportOptionalOperand                    | "none"        | "error"       | "error"       | "error"       | "error" |
| reportRedeclaration                      | "none"        | "error"       | "error"       | "error"       | "error" |
| reportReturnType                         | "none"        | "error"       | "error"       | "error"       | "error" |
| reportTypedDictNotRequiredAccess         | "none"        | "error"       | "error"       | "error"       | "error" |
| reportPrivateImportUsage                 | "none"        | "error"       | "error"       | "error"       | "error" |
| reportUnboundVariable                    | "none"        | "error"       | "error"       | "error"       | "error" |
| reportUnhashable                         | "none"        | "error"       | "error"       | "error"       | "error" |
| reportUnusedCoroutine                    | "none"        | "error"       | "error"       | "error"       | "error" |
| reportUnusedExcept                       | "unreachable" | "error"       | "error"       | "error"       | "error" |
| reportFunctionMemberAccess               | "none"        | "none"        | "error"       | "error"       | "error" |
| reportIncompatibleMethodOverride         | "none"        | "none"        | "error"       | "error"       | "error" |
| reportIncompatibleVariableOverride       | "none"        | "none"        | "error"       | "error"       | "error" |
| reportOverlappingOverload                | "none"        | "none"        | "error"       | "error"       | "error" |
| reportPossiblyUnboundVariable            | "none"        | "none"        | "error"       | "error"       | "error" |
| reportConstantRedefinition               | "none"        | "none"        | "none"        | "error"       | "error" |
| reportDeprecated                         | "deprecated"  | "deprecated"  | "deprecated"  | "error"       | "error" |
| reportDuplicateImport                    | "none"        | "none"        | "none"        | "error"       | "error" |
| reportIncompleteStub                     | "none"        | "none"        | "none"        | "error"       | "error" |
| reportInconsistentConstructor            | "none"        | "none"        | "none"        | "error"       | "error" |
| reportInvalidStubStatement               | "none"        | "none"        | "none"        | "error"       | "error" |
| reportMatchNotExhaustive                 | "none"        | "none"        | "none"        | "error"       | "error" |
| reportMissingParameterType               | "none"        | "none"        | "none"        | "error"       | "error" |
| reportMissingTypeArgument                | "none"        | "none"        | "none"        | "error"       | "error" |
| reportPrivateUsage                       | "none"        | "none"        | "none"        | "error"       | "error" |
| reportTypeCommentUsage                   | "deprecated"  | "deprecated"  | "deprecated"  | "error"       | "error" |
| reportUnknownArgumentType                | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUnknownLambdaType                  | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUnknownMemberType                  | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUnknownParameterType               | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUnknownVariableType                | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUnnecessaryCast                    | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUnnecessaryComparison              | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUnnecessaryContains                | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUnnecessaryIsInstance              | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUnusedClass                        | "unused"      | "unused"      | "unused"      | "error"       | "error" |
| reportUnusedImport                       | "unused"      | "unused"      | "unused"      | "error"       | "error" |
| reportUnusedFunction                     | "unused"      | "unused"      | "unused"      | "error"       | "error" |
| reportUnusedVariable                     | "unused"      | "unused"      | "unused"      | "error"       | "error" |
| reportUntypedBaseClass                   | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUntypedClassDecorator              | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUntypedFunctionDecorator           | "none"        | "none"        | "none"        | "error"       | "error" |
| reportUntypedNamedTuple                  | "none"        | "none"        | "none"        | "error"       | "error" |
| reportCallInDefaultInitializer           | "none"        | "none"        | "none"        | "none"        | "error" |
| reportImplicitOverride                   | "none"        | "none"        | "none"        | "none"        | "error" |
| reportImplicitStringConcatenation        | "none"        | "none"        | "none"        | "none"        | "error" |
| reportImportCycles                       | "none"        | "none"        | "none"        | "none"        | "error" |
| reportMissingSuperCall                   | "none"        | "none"        | "none"        | "none"        | "error" |
| reportPropertyTypeMismatch               | "none"        | "none"        | "none"        | "none"        | "error" |
| reportShadowedImports                    | "none"        | "none"        | "none"        | "none"        | "error" |
| reportUninitializedInstanceVariable      | "none"        | "none"        | "none"        | "none"        | "error" |
| reportUnnecessaryTypeIgnoreComment       | "none"        | "none"        | "none"        | "none"        | "error" |
| reportUnusedCallResult                   | "none"        | "none"        | "none"        | "none"        | "error" |
| reportUnreachable                        | "unreachable" | "unreachable" | "unreachable" | "unreachable" | "error" |
| reportAny                                | "none"        | "none"        | "none"        | "none"        | "error" |
| reportIgnoreCommentWithoutRule           | "none"        | "none"        | "none"        | "none"        | "error" |
| reportPrivateLocalImportUsage            | "none"        | "none"        | "none"        | "none"        | "error" |
| reportImplicitRelativeImport             | "none"        | "none"        | "none"        | "none"        | "error" |
| reportInvalidCast                        | "none"        | "none"        | "none"        | "none"        | "error" |
| reportUnsafeMultipleInheritance          | "none"        | "none"        | "none"        | "none"        | "error" |
| reportUnusedParameter                    | "unused"      | "unused"      | "unused"      | "unused"      | "error" |

## Overriding settings (in VS Code)

If a pyproject.toml (with a pyright section) or a pyrightconfig.json exists, any pyright settings in a VS Code setttings.json will be ignored. Pyrightconfig.json is prescribing the environment to be used for a particular project. Changing the environment configuration options per user is not supported.

If a pyproject.toml (with a pyright section) or a pyrightconfig.json does not exist, then the VS Code settings.json settings apply.

## Locale Configuration

Pyright provides diagnostic messages that are translated to multiple languages. By default, pyright uses the default locale of the operating system. You can override the desired locale through the use of one of the following environment variables, listed in priority order.

```
LC_ALL="de"
LC_MESSAGES="en-us"
LANG="zh-cn"
LANGUAGE="fr"
```

When running in VS Code, the editor's locale takes precedence. Setting these environment variables applies only when using pyright outside of VS Code.