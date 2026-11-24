import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The share image (src/app/[lang]/opengraph-image.tsx) reads these files from disk at request time.
  outputFileTracingIncludes: {
    "/\\[lang\\]/opengraph-image": [
      "./node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff",
      "./node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff",
      "./node_modules/@fontsource/inter/files/inter-latin-500-normal.woff",
      "./public/brand/asfra-logo-512.png",
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
