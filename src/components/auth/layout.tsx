"use client";

import * as React from "react";
import RouterLink from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { paths } from "@/paths";

export interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
	return (
		<Box
			sx={{
				minHeight: "100dvh",
				display: "flex",
				flexDirection: "column",
				bgcolor: "background.default",
			}}
		>
			{/* Logo chữ */}
			<Box sx={{ p: 3 }}>
				<Typography
					variant="h6"
					sx={{
						textDecoration: "none",
						color: "text.primary",
						fontWeight: 800,
						letterSpacing: 0.2,
					}}
				>
					E-Profile
				</Typography>
			</Box>

			{/* Khu vực hiển thị form */}
			<Box sx={{ flex: "1 1 auto", display: "grid", placeItems: "center", p: 3 }}>
				<Box sx={{ width: "100%", maxWidth: 450 }}>{children}</Box>
			</Box>
		</Box>
	);
}
