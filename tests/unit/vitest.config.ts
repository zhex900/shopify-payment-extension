import path from "node:path";

import { defineConfig, mergeConfig } from "vitest/config";

import rootConfig from "../../vitest.config";

export default mergeConfig(
  rootConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      include: ["*.test.?(c|m)[jt]s?(x)", "**/*.test.?(c|m)[jt]s?(x)"],
      setupFiles: [
        "../test-utilities/shopify.setup.ts",
        "../test-utilities/testing-library.setup.ts",
      ],
      testTimeout: 190000,
      globals: true,
      css: true,
    },
    resolve: {
      alias: {
        "@testing-library/polaris": path.resolve(
          __dirname,
          "../test-utilities/testing-library-polaris.tsx",
        ),
      },
    },
  }),
);
