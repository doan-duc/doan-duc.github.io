/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ---------------------------------------------------------------------------
  // DEPLOY NOTE:
  // - On Vercel (recommended): leave this file as-is.
  // - On GitHub Pages (static export): uncomment the two lines below and set
  //   basePath to your repo name if it is not served from the domain root.
  // ---------------------------------------------------------------------------
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
