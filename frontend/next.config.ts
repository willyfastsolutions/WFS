import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Set basePath only when deploying to GitHub Pages
  basePath: isGithubActions ? '/WFS' : undefined,
};

export default nextConfig;
