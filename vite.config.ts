import fs from "node:fs/promises";

import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import tsconfigPaths from "vite-tsconfig-paths";

/// <reference types="vitest" />
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
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
    define: {
      // The `util` package requires `process.env.NODE_DEBUG` to be present: https://github.com/browserify/node-util/blob/ef984721db7150f651800e051de4314c9517d42c/util.js#L109
      // `bakeryjs` imports `util` to treat it as a polyfill for `window.TextDecoder` in node environments: https://github.com/juju/bakeryjs/blob/0c28d6109252eb421fde482fb8d5fd3ddd8e6499/package.json#L61
      // This work around instructs `vite` to inject `process.env.NODE_DEBUG` into the global
      // scope, in development mode, and it will find-and-replace the source code to perform the
      // update.
      "process.env.NODE_DEBUG": JSON.stringify(process.env.NODE_DEBUG),
    },
    plugins: [
      react(),
      tsconfigPaths(),
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
        async writeBundle() {
          const files = [
            "build/config.demo.js",
            "build/config.jaas.js",
            "build/config.local.js",
          ];
          for (const file of files) {
            try {
              await fs.rm(file);
            } catch (error) {
              console.log("Could not remove", file, error);
            }
          }
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
