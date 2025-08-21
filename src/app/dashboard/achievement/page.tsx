"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
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
	opponent?: string;
};

const ACHIEVEMENTS: Achievement[] = [
	{
		group: "OLYMPIC GAMES",
		rank: 4,
		city: "Paris",
		event: "10m Air Pistol Women",
		detail: "Qualification: 578, Final: 198.6",
		year: 2024,
		opponent: "Kim M.",
	},
	{
		group: "OLYMPIC GAMES",
		rank: 7,
		city: "Paris",
		event: "25m Pistol Women",
		detail: "Qualification: 587, Medal Match: 16",
		year: 2024,
		opponent: "Zhang L.",
	},

	{
		group: "WORLD CHAMPIONSHIPS",
		rank: 5,
		city: "Baku",
		event: "10m Air Pistol Women",
		detail: "Qualification: 579, Final: 175.6",
		year: 2023,
		opponent: "Lee S.",
	},
	{
		group: "WORLD CHAMPIONSHIPS",
		rank: 10,
		city: "Baku",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 577",
		year: 2023,
		opponent: "Pair K.",
	},
	{
		group: "WORLD CHAMPIONSHIPS",
		rank: 15,
		city: "Cairo",
		event: "10m Air Pistol Women",
		detail: "Qualification: 577",
		year: 2022,
		opponent: "Singh P.",
	},
	{
		group: "WORLD CHAMPIONSHIPS",
		rank: 28,
		city: "Cairo",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 571",
		year: 2022,
		opponent: "Pair T.",
	},

	{
		group: "WORLD CUP",
		rank: 7,
		city: "Munich",
		event: "25m Pistol Women",
		detail: "Qualification: 587, Medal Match: 15",
		year: 2025,
		opponent: "Karpova A.",
	},
	{
		group: "WORLD CUP",
		rank: 10,
		city: "Baku",
		event: "25m Pistol Women",
		detail: "Qualification: 584",
		year: 2024,
		opponent: "Sato R.",
	},
	{
		group: "WORLD CUP",
		rank: 10,
		city: "Munich",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 574",
		year: 2024,
		opponent: "Pair D.",
	},
	{
		group: "WORLD CUP",
		rank: 13,
		city: "Munich",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 574",
		year: 2025,
		opponent: "Pair E.",
	},
	{
		group: "WORLD CUP",
		rank: 19,
		city: "Baku",
		event: "10m Air Pistol Women",
		detail: "Qualification: 572",
		year: 2024,
		opponent: "Jang H.",
	},
	{
		group: "WORLD CUP",
		rank: 21,
		city: "Munich",
		event: "25m Pistol Women",
		detail: "Qualification: 580",
		year: 2024,
		opponent: "Park N.",
	},
	{
		group: "WORLD CUP",
		rank: 27,
		city: "Munich",
		event: "10m Air Pistol Women",
		detail: "Qualification: 573",
		year: 2025,
		opponent: "Ivanova O.",
	},
	{
		group: "WORLD CUP",
		rank: 44,
		city: "Munich",
		event: "10m Air Pistol Women",
		detail: "Qualification: 570",
		year: 2024,
		opponent: "Chen Y.",
	},

	{
		group: "OLYMPIC QUALIFICATION CHAMPIONSHIP",
		rank: 4,
		city: "Rio De Janeiro",
		event: "25m Pistol Women",
		detail: "Qualification: 588, Medal Match: 23",
		year: 2024,
		opponent: "Gutierrez M.",
	},
	{
		group: "OLYMPIC QUALIFICATION CHAMPIONSHIP",
		rank: 8,
		city: "Rio De Janeiro",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 573",
		year: 2024,
		opponent: "Pair B.",
	},

	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 1,
		city: "Jakarta",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 580, Medal Matches: 17",
		year: 2024,
		opponent: "Pair J.",
	},
	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 2,
		city: "Jakarta",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 576, Medal Matches: 12",
		year: 2023,
		opponent: "Pair Q.",
	},
	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 3,
		city: "Changwon",
		event: "10m Air Pistol Women",
		detail: "Qualification: 581, Final: 219.7",
		year: 2023,
		opponent: "Kang Y.",
	},
	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 4,
		city: "Jakarta",
		event: "10m Air Pistol Women",
		detail: "Qualification: 571, Final Stage Elimination: 245.6",
		year: 2023,
		opponent: "Huang C.",
	},
	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 8,
		city: "Changwon",
		event: "10m Air Pistol Mixed Team",
		detail: "Qualification: 580",
		year: 2023,
		opponent: "Pair L.",
	},
	{
		group: "ASIAN CHAMPIONSHIPS",
		rank: 15,
		city: "Jakarta",
		event: "10m Air Pistol Women",
		detail: "Qualification: 572",
		year: 2024,
		opponent: "Ng K.",
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

type RatingKey = "excellent" | "good" | "improve";
type ReviewItem = { id: string; name: string; rating: RatingKey; note: string };
const ratingLabel: Record<RatingKey, string> = { excellent: "Xuất sắc", good: "Tốt", improve: "Cần cải thiện" };
const ratingColor: Record<RatingKey, "success" | "warning" | "error"> = {
	excellent: "success",
	good: "warning",
	improve: "error",
};

function CoachReviewCard({ items, onChange }: { items: ReviewItem[]; onChange: (next: ReviewItem[]) => void }) {
	const [editing, setEditing] = React.useState(false);
	const [draft, setDraft] = React.useState<ReviewItem[]>(items);
	React.useEffect(() => {
		if (!editing) setDraft(items);
	}, [items, editing]);
	const setItem = (id: string, patch: Partial<ReviewItem>) =>
		setDraft((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

	return (
		<Card>
			<CardHeader title="Đánh giá chung của huấn luyện viên" />
			<Divider />
			<List sx={{ py: 0 }}>
				{draft.map((it, idx) => (
					<ListItem key={it.id} divider={idx < draft.length - 1} sx={{ alignItems: "stretch" }}>
						<Box sx={{ width: "100%" }}>
							<Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
								<ListItemText primary={it.name} primaryTypographyProps={{ fontWeight: 600 }} />
								{editing ? (
									<TextField
										select
										size="small"
										value={it.rating}
										onChange={(e) => setItem(it.id, { rating: e.target.value as RatingKey })}
										sx={{ minWidth: 180 }}
									>
										<MenuItem value="excellent">{ratingLabel.excellent}</MenuItem>
										<MenuItem value="good">{ratingLabel.good}</MenuItem>
										<MenuItem value="improve">{ratingLabel.improve}</MenuItem>
									</TextField>
								) : (
									<Chip label={ratingLabel[it.rating]} color={ratingColor[it.rating]} size="small" />
								)}
							</Stack>
							<Box sx={{ mt: 1 }}>
								{editing ? (
									<TextField
										fullWidth
										size="small"
										multiline
										minRows={2}
										value={it.note}
										onChange={(e) => setItem(it.id, { note: e.target.value })}
										placeholder="Nhận xét chi tiết…"
									/>
								) : (
									<ListItemText secondary={it.note || "—"} secondaryTypographyProps={{ color: "text.secondary" }} />
								)}
							</Box>
						</Box>
					</ListItem>
				))}
			</List>
		</Card>
	);
}

export default function Page(): React.JSX.Element {
	const [q, setQ] = React.useState("");
	const [opponent, setOpponent] = React.useState("");
	const [group, setGroup] = React.useState<Group | "TẤT CẢ">("TẤT CẢ");
	const [sortBy, setSortBy] = React.useState<"mới-nhất" | "cũ-nhất">("mới-nhất");
	const [rankSort, setRankSort] = React.useState<"none" | "best" | "worst">("none");
	const [reviews, setReviews] = React.useState<ReviewItem[]>([
		{ id: "r1", name: "Tư thế ngắm", rating: "good", note: "Ổn định, kiểm soát vai tốt." },
		{ id: "r2", name: "Kích hoạt cò", rating: "excellent", note: "Đều, không giật." },
		{ id: "r3", name: "Theo dõi sau bắn", rating: "good", note: "Giữ ngắm >1s sau cò." },
		{ id: "r4", name: "Nhịp thở", rating: "improve", note: "Cần đồng bộ với bóp cò." },
		{ id: "r5", name: "Tập trung tinh thần", rating: "good", note: "Hạn chế xem điểm từng phát." },
	]);

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
					String(r.year).includes(s) ||
					(r.opponent || "").toLowerCase().includes(s)
			);
		}
		if (opponent.trim()) {
			const so = opponent.toLowerCase();
			data = data.filter((r) => (r.opponent || "").toLowerCase().includes(so));
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
	}, [q, opponent, group, sortBy, rankSort]);

	return (
		<Grid container spacing={3}>
			<Grid size={{ xs: 12 }}>
				<CoachReviewCard items={reviews} onChange={setReviews} />
			</Grid>

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
										style={{ width: 20, height: 20, borderRadius: 999, display: "inline-block", background: m.color }}
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
							<TextField fullWidth size="small" label="Tìm kiếm" value={q} onChange={(e) => setQ(e.target.value)} />
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
									<TableCell>Đối thủ</TableCell>
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
										<TableCell>{r.opponent || "—"}</TableCell>
										<TableCell>{r.year}</TableCell>
									</TableRow>
								))}
								{rows.length === 0 && (
									<TableRow>
										<TableCell colSpan={5}>
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
