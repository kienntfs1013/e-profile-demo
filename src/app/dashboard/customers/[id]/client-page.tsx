"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { users, type User } from "@/models/user";
import { Avatar, Box, Button, MenuItem, Paper, Stack, TextField, Typography, useMediaQuery } from "@mui/material";

import { AchievementSection } from "@/components/customer-detail/achievement-section";
import { GeneralSection } from "@/components/customer-detail/general-section";
import { HealthSection } from "@/components/customer-detail/health-section";
import { SectionCard } from "@/components/customer-detail/section-card";
import { TrainingSection } from "@/components/customer-detail/training-section";

type TabKey = "general" | "health" | "training" | "achievement";
const TABS: { key: TabKey; label: string }[] = [
	{ key: "general", label: "Thông tin chung" },
	{ key: "health", label: "Sức khỏe" },
	{ key: "training", label: "Tập luyện" },
	{ key: "achievement", label: "Thành tích" },
];

export default function ClientPage({ id }: { id: string }): React.JSX.Element {
	const router = useRouter();
	const isDesktop = useMediaQuery("(min-width:900px)");

	const user: User | undefined = React.useMemo(() => users.find((u) => u.id === id), [id]);

	const [tab, setTab] = React.useState<TabKey>("general");

	if (!user) {
		return (
			<Box sx={{ p: 4, width: "100%" }}>
				<Typography variant="h5">Không tìm thấy người dùng</Typography>
				<Box mt={2}>
					<Button variant="outlined" onClick={() => router.push("/dashboard/customers")}>
						Quay lại danh sách
					</Button>
				</Box>
			</Box>
		);
	}

	return (
		<Stack spacing={2} sx={{ px: { xs: 1.5, md: 2 }, pb: 3, width: "100%" }}>
			<Paper
				elevation={0}
				sx={{
					width: "100%",
					borderRadius: 2,
					p: { xs: 2, md: 3 },
					border: "1px solid",
					borderColor: "divider",
				}}
			>
				<Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
					<Avatar src={user.avatar} alt={user.name} sx={{ width: 72, height: 72, border: "2px solid #fff" }} />
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography variant="h5" sx={{ fontWeight: 700 }}>
							{user.name}
						</Typography>
					</Box>
				</Stack>
			</Paper>

			{isDesktop ? (
				<Box sx={{ display: "flex", gap: 1, mb: 2, width: "100%" }}>
					{TABS.map((t) => (
						<Button
							key={t.key}
							onClick={() => setTab(t.key)}
							variant={tab === t.key ? "contained" : "outlined"}
							color="primary"
							disableElevation
							sx={{
								flexBasis: "25%",
								maxWidth: "25%",
								borderRadius: 2,
								textTransform: "none",
								fontWeight: 600,
								py: 1.25,
							}}
						>
							{t.label}
						</Button>
					))}
				</Box>
			) : (
				<TextField
					select
					fullWidth
					size="small"
					label="Chọn mục"
					value={tab}
					onChange={(e) => setTab(e.target.value as TabKey)}
				>
					{TABS.map((t) => (
						<MenuItem key={t.key} value={t.key}>
							{t.label}
						</MenuItem>
					))}
				</TextField>
			)}

			<SectionCard>
				{tab === "general" && <GeneralSection user={user} />}
				{tab === "health" && <HealthSection user={user} />}
				{tab === "training" && <TrainingSection user={user} />}
				{tab === "achievement" && <AchievementSection user={user} />}
			</SectionCard>
		</Stack>
	);
}
