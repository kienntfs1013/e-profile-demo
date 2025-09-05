/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
	output: "standalone",
	images: {
		unoptimized: false,
	},
	experimental: {
		optimizePackageImports: ["@mui/material", "@mui/icons-material", "@mui/lab", "@phosphor-icons/react"],
	},
};
export default nextConfig;
