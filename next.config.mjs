/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
	reactStrictMode: false,
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
	output: "standalone",

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "tdtt.gov.vn",
			},
			{
				protocol: "https",
				hostname: "media-cdn-v2.laodong.vn",
			},
			{
				protocol: "https",
				hostname: "image.sggp.org.vn",
			},
			{
				protocol: "https",
				hostname: "cdn.nhandan.vn",
			},
			{
				protocol: "https",
				hostname: "static2-images.vnncdn.net",
			},
			{
				protocol: "https",
				hostname: "nguoiduatin.mediacdn.vn",
			},
			{
				protocol: "https",
				hostname: "hnm.1cdn.vn",
			},
		],
	},

	experimental: {
		optimizePackageImports: ["@mui/material", "@mui/icons-material", "@mui/lab", "@phosphor-icons/react"],
	},

	compiler: {
		removeConsole: isProd ? { exclude: ["error", "warn"] } : undefined,
	},

	async rewrites() {
		return [
			{
				source: "/gocare/:path*",
				destination: "https://portal.gocare.vn/api/:path*",
			},
		];
	},
};

export default nextConfig;
