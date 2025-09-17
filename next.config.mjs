/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
	reactStrictMode: false,
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
	output: "standalone",
	images: { unoptimized: true },
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
