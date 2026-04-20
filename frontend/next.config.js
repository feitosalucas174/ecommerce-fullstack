const path = require("path");
const os = require("os");

// Move build output outside OneDrive to avoid EINVAL on Windows symlink/rename ops.
// We compute a *relative* path because Next.js uses path.join(projectDir, distDir) internally.
const absTarget = path.join(os.tmpdir(), "nextjs-ecommerce", ".next");
const relTarget = path.relative(__dirname, absTarget);

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: relTarget,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

module.exports = nextConfig;
