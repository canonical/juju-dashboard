import { defineConfig, mergeConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

import baseConfig from "./vite.config";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig((env) =>
  mergeConfig(baseConfig(env), {
    plugins: [
      createHtmlPlugin({
        inject: {
          data: {
            injectScript:
              process.env.NODE_ENV === "development"
                ? '<script src="/config.jaas.js"></script>'
                : "",
          },
        },
      }),
      basicSsl(),
    ],
    server: {
      https: true,
    },
  }),
);
