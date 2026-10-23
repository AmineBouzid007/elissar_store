/** @type {import('next').NextConfig} */
const nextConfig = {
images: { unoptimized: true },
poweredByHeader: false,
serverExternalPackages: ["pg"],
experimental: { serverActions: { bodySizeLimit: "2mb" } },

async headers() {
return [
{
source: "/(.*)",
headers: [
{
key: "Content-Security-Policy",
value:
"default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
},
{
key: "X-Frame-Options",
value: "DENY",
},
{
key: "X-Content-Type-Options",
value: "nosniff",
},
{
key: "Referrer-Policy",
value: "strict-origin-when-cross-origin",
},
],
},
];
},
};

export default nextConfig;
