/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: [
      "extensions/payment-customization/src/*.test.ts",
      "**/*.test.?(c|m)[jt]s?(x)",
    ],
  },
});
