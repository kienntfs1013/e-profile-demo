"use client";

import * as React from "react";
import { Paper } from "@mui/material";

export function SectionCard({ children }: { children: React.ReactNode }) {
	return (
		<Paper
			elevation={0}
			sx={{
				width: "100%",
				p: { xs: 0, md: 0 },
			}}
		>
			{children}
		</Paper>
	);
}
