import type { Viewport } from "next";

import { Providers } from "./providers";

export const viewport = { width: "device-width", initialScale: 1 } satisfies Viewport;

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
