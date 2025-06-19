var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { createHtmlPlugin } from "vite-plugin-html";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import fs from "node:fs/promises";
/// <reference types="vitest" />
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), "");
    return {
        build: {
            outDir: "build",
        },
        css: {
            devSourcemap: true,
            preprocessorOptions: {
                scss: {
                    api: "modern-compiler",
                    quietDeps: true,
                    silenceDeprecations: ["import", "global-builtin", "mixed-decls"],
                },
            },
        },
        plugins: [
            react(),
            tsconfigPaths(),
            nodePolyfills({
                // Whether to polyfill specific globals.
                globals: {
                    // Required by bakeryjs.
                    process: true,
                },
            }),
            process.env.NODE_ENV === "development"
                ? null
                : // The template format is handled by the dev and jaas configs when in development.
                    createHtmlPlugin({
                        inject: {
                            data: {
                                injectScript: "",
                            },
                        },
                    }),
            {
                // Remove config files that are used for development.
                name: "delete-configs",
                writeBundle: function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var files, _i, files_1, file, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    files = [
                                        "build/config.demo.js",
                                        "build/config.jaas.js",
                                        "build/config.local.js",
                                    ];
                                    _i = 0, files_1 = files;
                                    _a.label = 1;
                                case 1:
                                    if (!(_i < files_1.length)) return [3 /*break*/, 6];
                                    file = files_1[_i];
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, fs.rm(file)];
                                case 3:
                                    _a.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_1 = _a.sent();
                                    console.log("Could not remove", file, error_1);
                                    return [3 /*break*/, 5];
                                case 5:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 6: return [2 /*return*/];
                            }
                        });
                    });
                },
            },
        ],
        server: {
            allowedHosts: true,
            host: "0.0.0.0",
            port: Number(env.PORT),
        },
        test: {
            coverage: {
                exclude: [
                    "src/testing/**",
                    "src/**/*.d.ts",
                    "src/**/*.test.[jt]s?(x)",
                    "src/**/{index,types}.ts",
                ],
                include: ["src/**/*.[jt]s?(x)"],
                reporter: ["text", "json-summary", "json", "cobertura"],
                reportOnFailure: true,
                thresholds: {
                    lines: 95,
                    statements: 95,
                    functions: 95,
                    branches: 90,
                },
            },
            environment: "happy-dom",
            globals: true,
            include: [
                "src/**/*.{test,spec}.?(c|m)[jt]s?(x)",
                "demo/**/*.{test,spec}.?(c|m)[jt]s?(x)",
            ],
            mockRestore: true,
            setupFiles: "src/testing/setup.ts",
        },
        resolve: {
            conditions: ["module-sync"],
        },
    };
});
