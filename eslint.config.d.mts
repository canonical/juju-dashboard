declare const _default: (import("eslint").Linter.Config<import("eslint").Linter.RulesRecord> | {
    plugins: {
        prettier: import("eslint").ESLint.Plugin;
        vitest: {
            meta: {
                name: string;
                version: string;
            };
            rules: {
                "prefer-lowercase-title": import("eslint").Rule.RuleModule;
                "max-nested-describe": import("eslint").Rule.RuleModule;
                "no-identical-title": import("eslint").Rule.RuleModule;
                "no-focused-tests": import("eslint").Rule.RuleModule;
                "no-conditional-tests": import("eslint").Rule.RuleModule;
                "expect-expect": import("eslint").Rule.RuleModule;
                "consistent-test-it": import("eslint").Rule.RuleModule;
                "prefer-to-be": import("eslint").Rule.RuleModule;
                "no-hooks": import("eslint").Rule.RuleModule;
                "no-restricted-vi-methods": import("eslint").Rule.RuleModule;
                "consistent-test-filename": import("eslint").Rule.RuleModule;
                "max-expects": import("eslint").Rule.RuleModule;
                "no-alias-methods": import("eslint").Rule.RuleModule;
                "no-commented-out-tests": import("eslint").Rule.RuleModule;
                "no-conditional-expect": import("eslint").Rule.RuleModule;
                "no-conditional-in-test": import("eslint").Rule.RuleModule;
                "no-disabled-tests": import("eslint").Rule.RuleModule;
                "no-done-callback": import("eslint").Rule.RuleModule;
                "no-duplicate-hooks": import("eslint").Rule.RuleModule;
                "no-large-snapshots": import("eslint").Rule.RuleModule;
                "no-interpolation-in-snapshots": import("eslint").Rule.RuleModule;
                "no-mocks-import": import("eslint").Rule.RuleModule;
                "no-restricted-matchers": import("eslint").Rule.RuleModule;
                "no-standalone-expect": import("eslint").Rule.RuleModule;
                "no-test-prefixes": import("eslint").Rule.RuleModule;
                "no-test-return-statement": import("eslint").Rule.RuleModule;
                "no-import-node-test": import("eslint").Rule.RuleModule;
                "prefer-called-with": import("eslint").Rule.RuleModule;
                "valid-title": import("eslint").Rule.RuleModule;
                "valid-expect": import("eslint").Rule.RuleModule;
                "prefer-to-be-falsy": import("eslint").Rule.RuleModule;
                "prefer-to-be-object": import("eslint").Rule.RuleModule;
                "prefer-to-be-truthy": import("eslint").Rule.RuleModule;
                "prefer-to-have-length": import("eslint").Rule.RuleModule;
                "prefer-equality-matcher": import("eslint").Rule.RuleModule;
                "prefer-strict-equal": import("eslint").Rule.RuleModule;
                "prefer-expect-resolves": import("eslint").Rule.RuleModule;
                "prefer-each": import("eslint").Rule.RuleModule;
                "prefer-hooks-on-top": import("eslint").Rule.RuleModule;
                "prefer-hooks-in-order": import("eslint").Rule.RuleModule;
                "require-local-test-context-for-concurrent-snapshots": import("eslint").Rule.RuleModule;
                "prefer-mock-promise-shorthand": import("eslint").Rule.RuleModule;
                "prefer-snapshot-hint": import("eslint").Rule.RuleModule;
                "valid-describe-callback": import("eslint").Rule.RuleModule;
                "require-top-level-describe": import("eslint").Rule.RuleModule;
                "require-to-throw-message": import("eslint").Rule.RuleModule;
                "require-hook": import("eslint").Rule.RuleModule;
                "prefer-todo": import("eslint").Rule.RuleModule;
                "prefer-spy-on": import("eslint").Rule.RuleModule;
                "prefer-comparison-matcher": import("eslint").Rule.RuleModule;
                "prefer-to-contain": import("eslint").Rule.RuleModule;
                "prefer-expect-assertions": import("eslint").Rule.RuleModule;
            };
            configs: {
                "legacy-recommended": {
                    plugins: string[];
                    rules: {};
                };
                "legacy-all": {
                    plugins: string[];
                    rules: {};
                };
                recommended: {
                    plugins: {
                        readonly vitest: import("eslint").ESLint.Plugin;
                    };
                    rules: {
                        readonly "vitest/expect-expect": "error";
                        readonly "vitest/no-identical-title": "error";
                        readonly "vitest/no-commented-out-tests": "error";
                        readonly "vitest/valid-title": "error";
                        readonly "vitest/valid-expect": "error";
                        readonly "vitest/valid-describe-callback": "error";
                        readonly "vitest/require-local-test-context-for-concurrent-snapshots": "error";
                        readonly "vitest/no-import-node-test": "error";
                    };
                };
                all: {
                    plugins: {
                        readonly vitest: import("eslint").ESLint.Plugin;
                    };
                    rules: {
                        readonly "vitest/prefer-lowercase-title": "warn";
                        readonly "vitest/max-nested-describe": "warn";
                        readonly "vitest/no-focused-tests": "warn";
                        readonly "vitest/no-conditional-tests": "warn";
                        readonly "vitest/consistent-test-it": "warn";
                        readonly "vitest/no-hooks": "warn";
                        readonly "vitest/no-restricted-vi-methods": "warn";
                        readonly "vitest/consistent-test-filename": "warn";
                        readonly "vitest/max-expects": "warn";
                        readonly "vitest/no-alias-methods": "warn";
                        readonly "vitest/no-conditional-expect": "warn";
                        readonly "vitest/no-conditional-in-test": "warn";
                        readonly "vitest/no-disabled-tests": "warn";
                        readonly "vitest/no-done-callback": "warn";
                        readonly "vitest/no-duplicate-hooks": "warn";
                        readonly "vitest/no-large-snapshots": "warn";
                        readonly "vitest/no-interpolation-in-snapshots": "warn";
                        readonly "vitest/no-mocks-import": "warn";
                        readonly "vitest/no-restricted-matchers": "warn";
                        readonly "vitest/no-standalone-expect": "warn";
                        readonly "vitest/no-test-prefixes": "warn";
                        readonly "vitest/no-test-return-statement": "warn";
                        readonly "vitest/prefer-called-with": "warn";
                        readonly "vitest/prefer-to-be-falsy": "warn";
                        readonly "vitest/prefer-to-be-object": "warn";
                        readonly "vitest/prefer-to-be-truthy": "warn";
                        readonly "vitest/prefer-to-have-length": "warn";
                        readonly "vitest/prefer-equality-matcher": "warn";
                        readonly "vitest/prefer-strict-equal": "warn";
                        readonly "vitest/prefer-expect-resolves": "warn";
                        readonly "vitest/prefer-each": "warn";
                        readonly "vitest/prefer-hooks-on-top": "warn";
                        readonly "vitest/prefer-hooks-in-order": "warn";
                        readonly "vitest/prefer-mock-promise-shorthand": "warn";
                        readonly "vitest/prefer-snapshot-hint": "warn";
                        readonly "vitest/require-top-level-describe": "warn";
                        readonly "vitest/require-to-throw-message": "warn";
                        readonly "vitest/require-hook": "warn";
                        readonly "vitest/prefer-todo": "warn";
                        readonly "vitest/prefer-spy-on": "warn";
                        readonly "vitest/prefer-comparison-matcher": "warn";
                        readonly "vitest/prefer-to-contain": "warn";
                        readonly "vitest/prefer-expect-assertions": "warn";
                        readonly "vitest/prefer-to-be": "warn";
                    };
                };
                env: {
                    languageOptions: {
                        globals: {
                            suite: "writable";
                            test: "writable";
                            describe: "writable";
                            it: "writable";
                            expect: "writable";
                            assert: "writable";
                            vitest: "writable";
                            vi: "writable";
                            beforeAll: "writable";
                            afterAll: "writable";
                            beforeEach: "writable";
                            afterEach: "writable";
                        };
                    };
                };
            };
            environments: {
                env: {
                    globals: {
                        suite: true;
                        test: true;
                        describe: true;
                        it: true;
                        expect: true;
                        assert: true;
                        vitest: true;
                        vi: true;
                        beforeAll: true;
                        afterAll: true;
                        beforeEach: true;
                        afterEach: true;
                    };
                };
            };
        };
        promise: import("eslint").ESLint.Plugin;
        "react-refresh": {
            rules: Record<string, any>;
            configs: {
                recommended: {
                    plugins: {
                        "react-refresh": {
                            rules: Record<string, any>;
                        };
                    };
                    rules: Record<string, any>;
                };
                vite: {
                    plugins: {
                        "react-refresh": {
                            rules: Record<string, any>;
                        };
                    };
                    rules: Record<string, any>;
                };
            };
        };
        react: import("eslint").ESLint.Plugin;
        import: import("eslint").ESLint.Plugin;
    };
    languageOptions: {
        globals: {
            window: boolean;
            document: boolean;
            localStorage: boolean;
            windowLocation: boolean;
            jujuDashboardConfig: boolean;
            lightningjs: boolean;
        };
        parser: typeof tsParser;
        ecmaVersion: number;
        sourceType: string;
        parserOptions: {
            parser: string;
            project: string[];
            ecmaFeatures: {
                jsx: boolean;
            };
        };
    };
    settings: {
        "import/resolver": {
            node: {
                paths: string[];
            };
        };
        react: {
            version: string;
        };
    };
    rules: {
        "@typescript-eslint/consistent-type-imports": string;
        "@typescript-eslint/no-floating-promises": string;
        "@typescript-eslint/no-misused-promises": string;
        "prefer-promise-reject-errors": string;
        "@typescript-eslint/await-thenable": string;
        "react/jsx-filename-extension": (number | {
            extensions: string[];
        })[];
        "import/prefer-default-export": number;
        "import/imports-first": string[];
        "import/newline-after-import": string;
        "import/order": (string | {
            "newlines-between": string;
            alphabetize: {
                order: string;
            };
            groups: string[];
        })[];
        "vitest/prefer-expect-assertions": number;
        "vitest/no-hooks": number;
        "default-case": number;
        "no-param-reassign": number;
        "no-case-declarations": number;
        "no-constant-condition": (string | {
            checkLoops: boolean;
        })[];
        "prefer-destructuring": number;
        "react/no-unescaped-entities": number;
        "react/display-name": number;
        "@typescript-eslint/no-duplicate-enum-values": number;
        "promise/catch-or-return": (string | {
            allowFinally: boolean;
        })[];
        "react-refresh/only-export-components": string[];
        "@typescript-eslint/no-unused-vars": (string | {
            caughtErrors: string;
            argsIgnorePattern: string;
            destructuredArrayIgnorePattern: string;
            varsIgnorePattern: string;
        })[];
        "no-unused-expressions": string;
        "@typescript-eslint/no-unused-expressions": (string | {
            allowShortCircuit: boolean;
        })[];
    };
})[];
export default _default;
import tsParser from "@typescript-eslint/parser";
