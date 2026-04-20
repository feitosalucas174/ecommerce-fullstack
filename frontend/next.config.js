const path = require("path");
const os = require("os");

// Em produção (Vercel) usa o .next padrão.
// Localmente no Windows com OneDrive, move o build para fora do OneDrive
// para evitar erros EINVAL em operações de rename/readlink.
const getDistDir = () => {
  if (process.env.NODE_ENV === "production") return ".next";
  const absTarget = path.join(os.tmpdir(), "nextjs-ecommerce", ".next");
  return path.relative(__dirname, absTarget);
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: getDistDir(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

module.exports = nextConfig;
