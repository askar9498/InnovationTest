// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";

export default defineConfig({
  base: "/",

  plugins: [
    // React compiler with SWC for faster builds
    react(),

    // JavaScript obfuscator plugin for production builds only
    obfuscatorPlugin({
      apply: "build", // Only apply on production build
      include: [
        "src/**/*.js",
        "src/**/*.jsx",
        // Only include specific TypeScript files that are safe to obfuscate
        "src/app/**/*.ts",
        "src/app/**/*.tsx",
      ],
      exclude: [
        /node_modules/,
        "src/env.ts",
        "src/_metronic/**/*.ts", // Exclude Metronic components from obfuscation
        "src/_metronic/**/*.tsx",
        "src/assets/**/*.ts",
        "src/assets/**/*.tsx",
        "src/config/**/*.ts",
        "src/components/**/*.ts",
        "src/components/**/*.tsx",
      ],
      debugger: true, // Adds debugger traps

      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        disableConsoleOutput: true,
        identifierNamesGenerator: "hexadecimal",
        renameGlobals: false,
        rotateStringArray: true,
        selfDefending: true,
        splitStrings: true,
        stringArray: true,
        stringArrayEncoding: ["base64"],
        stringArrayThreshold: 0.8,
        transformObjectKeys: true,
        unicodeEscapeSequence: false,
      },
    }),
  ],

  build: {
    sourcemap: false, // Don't expose source maps in production
    chunkSizeWarningLimit: 3000,
    minify: "esbuild", // Fast minification
    outDir: "dist", // Default output directory
    emptyOutDir: true, // Clean output before build
  },
});
