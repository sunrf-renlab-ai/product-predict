/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep static assets in /public/demo (the full prototype-derived report.html)
  // outside Next's processing. They're served as plain files.
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, anthropic-version, x-api-key, authorization, x-pp-version" },
        ],
      },
    ];
  },
};
export default nextConfig;
