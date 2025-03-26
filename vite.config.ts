import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { createHtmlPlugin } from "vite-plugin-html";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import fs from "node:fs/promises";

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
