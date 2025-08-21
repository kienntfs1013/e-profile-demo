"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/models/user";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Divider,
	IconButton,
	MenuItem,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";

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

type Ranking = { label: string; value: number };
const WORLD_RANKING: Ranking[] = [
	{ label: "25m Pistol Women", value: 7 },
	{ label: "10m Air Pistol Women", value: 8 },
];

type Medal = { label: string; color: string; value: number };
const MEDALS: Medal[] = [
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
			<CardHeader
				title="Đánh giá chung của huấn luyện viên"
				action={
					!editing ? (
						<Button size="small" variant="outlined" startIcon={<PencilSimple />} onClick={() => setEditing(true)}>
							Sửa
						</Button>
					) : (
						<Stack direction="row" spacing={1}>
							<Button size="small" variant="outlined" onClick={() => setEditing(false)}>
								Hủy
							</Button>
							<Button
								size="small"
								variant="contained"
								onClick={() => {
									onChange(draft);
									setEditing(false);
								}}
							>
								Lưu
							</Button>
						</Stack>
					)
				}
			/>
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

export function AchievementSection({ user }: { user?: User }): React.JSX.Element {
	const router = useRouter();
	const [q, setQ] = React.useState("");
	const [opponent, setOpponent] = React.useState("");
	const [group, setGroup] = React.useState<Group | "TẤT CẢ">("TẤT CẢ");
	const [sortBy, setSortBy] = React.useState<"mới-nhất" | "cũ-nhất">("mới-nhất");
	const [rankSort, setRankSort] = React.useState<"none" | "best" | "worst">("none");

	const [worldRanking, setWorldRanking] = React.useState<Ranking[]>(WORLD_RANKING);
	const [medals, setMedals] = React.useState<Medal[]>(MEDALS);
	const [achievements, setAchievements] = React.useState<Achievement[]>(ACHIEVEMENTS);

	const [reviews, setReviews] = React.useState<ReviewItem[]>([
		{ id: "r1", name: "Tư thế ngắm", rating: "good", note: "Ổn định, kiểm soát vai tốt." },
		{ id: "r2", name: "Kích hoạt cò", rating: "excellent", note: "Đều, không giật." },
		{ id: "r3", name: "Theo dõi sau bắn", rating: "good", note: "Giữ ngắm >1s sau cò." },
		{ id: "r4", name: "Nhịp thở", rating: "improve", note: "Cần đồng bộ với bóp cò." },
		{ id: "r5", name: "Tập trung tinh thần", rating: "good", note: "Hạn chế xem điểm từng phát." },
	]);

	const [confirm, setConfirm] = React.useState<
		| { type: "ranking"; payload: Ranking }
		| { type: "medal"; payload: Medal }
		| { type: "achievement"; payload: Achievement }
		| null
	>(null);

	const onAddRanking = () =>
		router.push(`/dashboard/customers/achievements/ranking/add?athlete=${encodeURIComponent(user?.id || "")}`);
	const onEditRanking = (label: string) =>
		router.push(
			`/dashboard/customers/achievements/ranking/update/${encodeURIComponent(label)}?athlete=${encodeURIComponent(
				user?.id || ""
			)}&label=${encodeURIComponent(label)}&value=${worldRanking.find((r) => r.label === label)?.value ?? ""}`
		);
	const onDeleteRanking = (label: string) => {
		const item = worldRanking.find((r) => r.label === label);
		if (item) setConfirm({ type: "ranking", payload: item });
	};

	const onAddMedal = () =>
		router.push(`/dashboard/customers/achievements/medals/add?athlete=${encodeURIComponent(user?.id || "")}`);
	const onEditMedal = (label: string) => {
		const m = medals.find((x) => x.label === label);
		router.push(
			`/dashboard/customers/achievements/medals/update/${encodeURIComponent(label)}?athlete=${encodeURIComponent(
				user?.id || ""
			)}&label=${encodeURIComponent(label)}&value=${m?.value ?? ""}&color=${encodeURIComponent(m?.color || "")}`
		);
	};
	const onDeleteMedal = (label: string) => {
		const m = medals.find((x) => x.label === label);
		if (m) setConfirm({ type: "medal", payload: m });
	};

	const onAddAchievement = () =>
		router.push(`/dashboard/customers/achievements/results/add?athlete=${encodeURIComponent(user?.id || "")}`);
	const onEditAchievement = (row: Achievement) =>
		router.push(
			`/dashboard/customers/achievements/results/update/${encodeURIComponent(
				`${row.group}-${row.year}-${row.rank}`
			)}?athlete=${encodeURIComponent(user?.id || "")}&group=${encodeURIComponent(row.group)}&rank=${row.rank}&city=${encodeURIComponent(
				row.city
			)}&event=${encodeURIComponent(row.event)}&detail=${encodeURIComponent(row.detail)}&year=${row.year}&opponent=${encodeURIComponent(
				row.opponent || ""
			)}`
		);
	const onDeleteAchievement = (row: Achievement) => setConfirm({ type: "achievement", payload: row });

	const rows = React.useMemo(() => {
		let data = achievements.slice();
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
		if (rankSort === "best") data.sort((a, b) => a.rank - b.rank || b.year - a.year);
		else if (rankSort === "worst") data.sort((a, b) => b.rank - a.rank || b.year - a.year);
		else
			data.sort((a, b) =>
				sortBy === "mới-nhất" ? b.year - a.year || a.rank - b.rank : a.year - b.year || a.rank - b.rank
			);
		return data;
	}, [q, opponent, group, sortBy, rankSort, achievements]);

	const onConfirmDelete = () => {
		if (!confirm) return;
		if (confirm.type === "ranking") setWorldRanking((prev) => prev.filter((r) => r !== confirm.payload));
		if (confirm.type === "medal") setMedals((prev) => prev.filter((m) => m !== confirm.payload));
		if (confirm.type === "achievement") setAchievements((prev) => prev.filter((a) => a !== confirm.payload));
		setConfirm(null);
	};

	return (
		<Stack spacing={3}>
			<CoachReviewCard items={reviews} onChange={setReviews} />

			<Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="stretch">
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Card sx={{ height: "100%" }}>
						<CardHeader
							title="Xếp hạng thế giới"
							action={
								<Button size="small" variant="contained" startIcon={<Plus />} onClick={onAddRanking}>
									Thêm mới
								</Button>
							}
						/>
						<Divider />
						<CardContent>
							<Stack spacing={1.25}>
								{worldRanking.map((r) => (
									<Stack key={r.label} direction="row" alignItems="center" spacing={1.25}>
										<Typography variant="body1" sx={{ flex: 1, minWidth: 0 }}>
											{r.label}
										</Typography>
										<Chip label={r.value} color="primary" variant="outlined" />
										<Box sx={{ ml: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
											<IconButton size="small" aria-label="sửa" onClick={() => onEditRanking(r.label)}>
												<PencilSimple />
											</IconButton>
											<IconButton size="small" aria-label="xóa" color="error" onClick={() => onDeleteRanking(r.label)}>
												<Trash />
											</IconButton>
										</Box>
									</Stack>
								))}
							</Stack>
						</CardContent>
					</Card>
				</Box>

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Card sx={{ height: "100%" }}>
						<CardHeader
							title="Huy chương (Asian Championships)"
							action={
								<Button size="small" variant="contained" startIcon={<Plus />} onClick={onAddMedal}>
									Thêm mới
								</Button>
							}
						/>
						<Divider />
						<CardContent>
							<Stack direction="row" spacing={2} flexWrap="wrap">
								{medals.map((m) => (
									<Stack key={m.label} alignItems="center" spacing={1} sx={{ minWidth: 92 }}>
										<span
											style={{ width: 20, height: 20, borderRadius: 999, display: "inline-block", background: m.color }}
										/>
										<Typography variant="body2">{m.label}</Typography>
										<Chip label={m.value} size="small" />
										<Stack direction="row" spacing={0.5}>
											<IconButton size="small" aria-label="sửa" onClick={() => onEditMedal(m.label)}>
												<PencilSimple />
											</IconButton>
											<IconButton size="small" aria-label="xóa" color="error" onClick={() => onDeleteMedal(m.label)}>
												<Trash />
											</IconButton>
										</Stack>
									</Stack>
								))}
							</Stack>
						</CardContent>
					</Card>
				</Box>
			</Stack>

			<Box sx={{ minWidth: 0 }}>
				<Card>
					<CardHeader
						title="Thành tích thi đấu"
						action={
							<Button size="small" variant="contained" startIcon={<Plus />} onClick={onAddAchievement}>
								Thêm mới
							</Button>
						}
					/>
					<Divider />
					<CardContent>
						<Stack
							direction={{ xs: "column", md: "row" }}
							spacing={2}
							sx={{ mb: 2 }}
							alignItems={{ xs: "stretch", md: "center" }}
							justifyContent="space-between"
						>
							<TextField
								fullWidth
								size="small"
								label="Tìm kiếm (giải / nội dung / thành phố / năm / đối thủ)"
								value={q}
								onChange={(e) => setQ(e.target.value)}
							/>
							<Stack direction="row" spacing={2} sx={{ width: { xs: "100%", md: "auto" } }}>
								<TextField
									size="small"
									label="Đối thủ"
									value={opponent}
									onChange={(e) => setOpponent(e.target.value)}
									sx={{ minWidth: 200, width: { xs: "100%", md: 200 } }}
								/>
								<TextField
									select
									size="small"
									label="Nhóm giải"
									value={group}
									onChange={(e) => setGroup(e.target.value as Group | "TẤT CẢ")}
									sx={{ minWidth: 260, width: { xs: "100%", md: 260 } }}
								>
									<MenuItem value="TẤT CẢ">Tất cả</MenuItem>
									<MenuItem value="OLYMPIC GAMES">OLYMPIC GAMES</MenuItem>
									<MenuItem value="WORLD CHAMPIONSHIPS">WORLD CHAMPIONSHIPS</MenuItem>
									<MenuItem value="WORLD CUP">WORLD CUP</MenuItem>
									<MenuItem value="OLYMPIC QUALIFICATION CHAMPIONSHIP">OLYMPIC QUALIFICATION CHAMPIONSHIP</MenuItem>
									<MenuItem value="ASIAN CHAMPIONSHIPS">ASIAN CHAMPIONSHIPS</MenuItem>
								</TextField>
								<TextField
									select
									size="small"
									label="Sắp xếp theo năm"
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value as "mới-nhất" | "cũ-nhất")}
									sx={{ minWidth: 160, width: { xs: "100%", md: 160 } }}
								>
									<MenuItem value="mới-nhất">Mới nhất</MenuItem>
									<MenuItem value="cũ-nhất">Cũ nhất</MenuItem>
								</TextField>
								<TextField
									select
									size="small"
									label="Xếp theo hạng"
									value={rankSort}
									onChange={(e) => setRankSort(e.target.value as "none" | "best" | "worst")}
									sx={{ minWidth: 180, width: { xs: "100%", md: 180 } }}
								>
									<MenuItem value="none">Không</MenuItem>
									<MenuItem value="best">Hạng cao → thấp</MenuItem>
									<MenuItem value="worst">Hạng thấp → cao</MenuItem>
								</TextField>
							</Stack>
						</Stack>

						<Box sx={{ overflowX: "auto" }}>
							<Table sx={{ minWidth: 1100 }}>
								<TableHead>
									<TableRow>
										<TableCell>Hạng</TableCell>
										<TableCell>Giải</TableCell>
										<TableCell>Thành phố & nội dung</TableCell>
										<TableCell>Đối thủ</TableCell>
										<TableCell>Năm</TableCell>
										<TableCell align="right">Thao tác</TableCell>
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
											<TableCell align="right">
												<IconButton aria-label="sửa" size="small" onClick={() => onEditAchievement?.(r)}>
													<PencilSimple />
												</IconButton>
												<IconButton
													aria-label="xóa"
													size="small"
													color="error"
													onClick={() => onDeleteAchievement?.(r)}
												>
													<Trash />
												</IconButton>
											</TableCell>
										</TableRow>
									))}
									{rows.length === 0 && (
										<TableRow>
											<TableCell colSpan={6}>
												<Typography align="center" color="text.secondary">
													Không có dữ liệu phù hợp.
												</Typography>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</Box>
					</CardContent>
				</Card>
			</Box>

			<Dialog open={!!confirm} onClose={() => setConfirm(null)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{confirm?.type === "ranking" &&
							`Bạn có chắc muốn xóa mục xếp hạng “${(confirm.payload as Ranking).label}”?`}
						{confirm?.type === "medal" && `Bạn có chắc muốn xóa huy chương “${(confirm.payload as Medal).label}”?`}
						{confirm?.type === "achievement" &&
							`Bạn có chắc muốn xóa thành tích ${(confirm.payload as Achievement).group} - ${(confirm.payload as Achievement).city} - ${(confirm.payload as Achievement).event} (${(confirm.payload as Achievement).year})?`}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" onClick={() => setConfirm(null)}>
						Hủy
					</Button>
					<Button color="error" variant="contained" onClick={onConfirmDelete}>
						Đồng ý
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}
