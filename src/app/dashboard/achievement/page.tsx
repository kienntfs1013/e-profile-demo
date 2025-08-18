"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

type Group =
	| "OLYMPIC GAMES"
	| "WORLD CHAMPIONSHIPS"
	| "WORLD CUP"
	| "OLYMPIC QUALIFICATION CHAMPIONSHIP"
	| "ASIAN CHAMPIONSHIPS";

type Achievement = {
	group: Group;
	rank: number;
	city: string;
	event: string;
	detail: string;
	year: number;
};

const ACHIEVEMENTS: Achievement[] = [
	{
		group: "OLYMPIC GAMES",
		rank: 4,
		city: "Paris",
		event: "10m Air Pistol Women",
		detail: "Qualification: 578, Final: 198.6",
		year: 2024,
	},
	{
		group: "OLYMPIC GAMES",
		rank: 7,
		city: "Paris",
		event: "25m Pistol Women",
		detail: "Qualification: 587, Medal Match: 16",
		year: 2024,
	},

	{
		group: "WORLD CHAMPIONSHIPS",
		rank: 5,
		city: "Baku",
		event: "10m Air Pistol Women",
		detail: "Qualification: 579, Final: 175.6",
		year: 2023,
	},
	{
		group: "WORLD CHAMPIONSHIPS",
		rank: 10,
		city: "Baku",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 577",
		year: 2023,
	},
	{
		group: "WORLD CHAMPIONSHIPS",
		rank: 15,
		city: "Cairo",
		event: "10m Air Pistol Women",
		detail: "Qualification: 577",
		year: 2022,
	},
	{
		group: "WORLD CHAMPIONSHIPS",
		rank: 28,
		city: "Cairo",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 571",
		year: 2022,
	},

	{
		group: "WORLD CUP",
		rank: 7,
		city: "Munich",
		event: "25m Pistol Women",
		detail: "Qualification: 587, Medal Match: 15",
		year: 2025,
	},
	{ group: "WORLD CUP", rank: 10, city: "Baku", event: "25m Pistol Women", detail: "Qualification: 584", year: 2024 },
	{
		group: "WORLD CUP",
		rank: 10,
		city: "Munich",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 574",
		year: 2024,
	},
	{
		group: "WORLD CUP",
		rank: 13,
		city: "Munich",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 574",
		year: 2025,
	},
	{
		group: "WORLD CUP",
		rank: 19,
		city: "Baku",
		event: "10m Air Pistol Women",
		detail: "Qualification: 572",
		year: 2024,
	},
	{ group: "WORLD CUP", rank: 21, city: "Munich", event: "25m Pistol Women", detail: "Qualification: 580", year: 2024 },
	{
		group: "WORLD CUP",
		rank: 27,
		city: "Munich",
		event: "10m Air Pistol Women",
		detail: "Qualification: 573",
		year: 2025,
	},
	{
		group: "WORLD CUP",
		rank: 44,
		city: "Munich",
		event: "10m Air Pistol Women",
		detail: "Qualification: 570",
		year: 2024,
	},

	{
		group: "OLYMPIC QUALIFICATION CHAMPIONSHIP",
		rank: 4,
		city: "Rio De Janeiro",
		event: "25m Pistol Women",
		detail: "Qualification: 588, Medal Match: 23",
		year: 2024,
	},
	{
		group: "OLYMPIC QUALIFICATION CHAMPIONSHIP",
		rank: 8,
		city: "Rio De Janeiro",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 573",
		year: 2024,
	},

	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 1,
		city: "Jakarta",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 580, Medal Matches: 17",
		year: 2024,
	},
	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 2,
		city: "Jakarta",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 576, Medal Matches: 12",
		year: 2023,
	},
	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 3,
		city: "Changwon",
		event: "10m Air Pistol Women",
		detail: "Qualification: 581, Final: 219.7",
		year: 2023,
	},
	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 4,
		city: "Jakarta",
		event: "10m Air Pistol Women",
		detail: "Qualification: 571, Final Stage Elimination: 245.6",
		year: 2023,
	},
	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 8,
		city: "Changwon",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 580",
		year: 2023,
	},
	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 15,
		city: "Jakarta",
		event: "10m Air Pistol Women",
		detail: "Qualification: 572",
		year: 2024,
	},
];

const WORLD_RANKING = [
	{ label: "25m Pistol Women", value: 7 },
	{ label: "10m Air Pistol Women", value: 8 },
];

const MEDALS = [
	{ label: "Vàng", color: "#f4c20d", value: 1 },
	{ label: "Bạc", color: "#d0d5db", value: 1 },
	{ label: "Đồng", color: "#d58b73", value: 1 },
];

export default function Page(): React.JSX.Element {
	const [q, setQ] = React.useState("");
	const [group, setGroup] = React.useState<Group | "TẤT CẢ">("TẤT CẢ");
	const [sortBy, setSortBy] = React.useState<"mới-nhất" | "cũ-nhất">("mới-nhất");
	const [rankSort, setRankSort] = React.useState<"none" | "best" | "worst">("none");

	const rows = React.useMemo(() => {
		let data = ACHIEVEMENTS.slice();

		if (group !== "TẤT CẢ") data = data.filter((r) => r.group === group);

		if (q.trim()) {
			const s = q.toLowerCase();
			data = data.filter(
				(r) =>
					r.city.toLowerCase().includes(s) ||
					r.event.toLowerCase().includes(s) ||
					r.group.toLowerCase().includes(s) ||
					String(r.year).includes(s)
			);
		}

		if (rankSort === "best") {
			data.sort((a, b) => a.rank - b.rank || (sortBy === "mới-nhất" ? b.year - a.year : a.year - b.year));
		} else if (rankSort === "worst") {
			data.sort((a, b) => b.rank - a.rank || (sortBy === "mới-nhất" ? b.year - a.year : a.year - b.year));
		} else {
			data.sort((a, b) =>
				sortBy === "mới-nhất" ? b.year - a.year || a.rank - b.rank : a.year - b.year || a.rank - b.rank
			);
		}

		return data;
	}, [q, group, sortBy, rankSort]);

	return (
		<Grid container spacing={3}>
			<Grid size={{ xs: 12, md: 6 }}>
				<Card>
					<CardHeader title="Xếp hạng thế giới" />
					<Divider />
					<CardContent>
						<Stack spacing={1.5}>
							{WORLD_RANKING.map((r) => (
								<Stack key={r.label} direction="row" alignItems="center" justifyContent="space-between">
									<Typography variant="body1">{r.label}</Typography>
									<Chip label={r.value} color="primary" variant="outlined" />
								</Stack>
							))}
						</Stack>
					</CardContent>
				</Card>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<Card>
					<CardHeader title="Huy chương (Asian Championships)" />
					<Divider />
					<CardContent>
						<Stack direction="row" spacing={2}>
							{MEDALS.map((m) => (
								<Stack key={m.label} alignItems="center" spacing={1}>
									<span
										style={{
											width: 20,
											height: 20,
											borderRadius: 999,
											display: "inline-block",
											background: m.color,
										}}
									/>
									<Typography variant="body2">{m.label}</Typography>
									<Chip label={m.value} size="small" />
								</Stack>
							))}
						</Stack>
					</CardContent>
				</Card>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Card>
					<CardHeader title="Thành tích thi đấu" />
					<Divider />
					<CardContent>
						{/* BỘ LỌC — auto-fit để lấp kín chiều ngang */}
						<Box
							sx={{
								display: "grid",
								gap: 2,
								mb: 2,
								gridTemplateColumns: {
									xs: "1fr",
									sm: "repeat(2, minmax(220px, 1fr))",
									md: "repeat(auto-fit, minmax(240px, 1fr))",
								},
								alignItems: "center",
							}}
						>
							<TextField
								fullWidth
								size="small"
								label="Tìm kiếm"
								value={q}
								onChange={(e) => setQ(e.target.value)}
							/>

							<TextField
								fullWidth
								select
								size="small"
								label="Nhóm giải"
								value={group}
								onChange={(e) => setGroup(e.target.value as Group | "TẤT CẢ")}
							>
								<MenuItem value="TẤT CẢ">Tất cả</MenuItem>
								<MenuItem value="OLYMPIC GAMES">OLYMPIC GAMES</MenuItem>
								<MenuItem value="WORLD CHAMPIONSHIPS">WORLD CHAMPIONSHIPS</MenuItem>
								<MenuItem value="WORLD CUP">WORLD CUP</MenuItem>
								<MenuItem value="OLYMPIC QUALIFICATION CHAMPIONSHIP">OLYMPIC QUALIFICATION CHAMPIONSHIP</MenuItem>
								<MenuItem value="ASIAN CHAMPIONSHIPS">ASIAN CHAMPIONSHIPS</MenuItem>
							</TextField>

							<TextField
								fullWidth
								select
								size="small"
								label="Sắp xếp theo năm"
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as "mới-nhất" | "cũ-nhất")}
							>
								<MenuItem value="mới-nhất">Mới nhất</MenuItem>
								<MenuItem value="cũ-nhất">Cũ nhất</MenuItem>
							</TextField>

							<TextField
								fullWidth
								select
								size="small"
								label="Xếp theo hạng"
								value={rankSort}
								onChange={(e) => setRankSort(e.target.value as "none" | "best" | "worst")}
							>
								<MenuItem value="none">Không</MenuItem>
								<MenuItem value="best">Hạng cao → thấp</MenuItem>
								<MenuItem value="worst">Hạng thấp → cao</MenuItem>
							</TextField>
						</Box>

						<Table sx={{ minWidth: 900 }}>
							<TableHead>
								<TableRow>
									<TableCell>Hạng</TableCell>
									<TableCell>Giải</TableCell>
									<TableCell>Thành phố & nội dung</TableCell>
									<TableCell>Năm</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((r, i) => (
									<TableRow hover key={`${r.group}-${r.year}-${r.rank}-${i}`}>
										<TableCell>
											<Chip label={r.rank} size="small" />
										</TableCell>
										<TableCell>{r.group}</TableCell>
										<TableCell>
											<Typography variant="subtitle2">{r.city}</Typography>
											<Typography variant="body2" color="text.secondary">
												{r.event}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{r.detail}
											</Typography>
										</TableCell>
										<TableCell>{r.year}</TableCell>
									</TableRow>
								))}
								{rows.length === 0 && (
									<TableRow>
										<TableCell colSpan={4}>
											<Typography align="center" color="text.secondary">
												Không có dữ liệu phù hợp.
											</Typography>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</Grid>
		</Grid>
	);
}
