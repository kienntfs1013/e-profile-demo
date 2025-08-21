"use client";

import * as React from "react";
import { MenuItem } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/ssr/DotsThreeVertical";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import dayjs from "dayjs";

import "dayjs/locale/vi";

dayjs.locale("vi");

interface Product {
	id: string;
	image: string;
	name: string;
	updatedAt: Date;
}

interface LatestProductsProps {
	products?: Product[];
	sx?: SxProps;
	title?: string;
	updatedPrefix?: string;
	hideRowMenu?: boolean;
}

function LatestProducts({
	products = [],
	sx,
	title = "Thiết bị đang sử dụng",
	updatedPrefix = "Cập nhật",
	hideRowMenu = false,
}: LatestProductsProps): React.JSX.Element {
	return (
		<Card sx={sx}>
			<CardHeader title={title} />
			<Divider />
			<List>
				{products.map((product, index) => (
					<ListItem divider={index < products.length - 1} key={product.id}>
						<ListItemAvatar>
							{product.image ? (
								<Box
									component="img"
									src={product.image}
									alt={product.name}
									sx={{ borderRadius: 1, height: 48, width: 48, objectFit: "cover" }}
								/>
							) : (
								<Box
									sx={{
										borderRadius: 1,
										backgroundColor: "var(--mui-palette-neutral-200)",
										height: 48,
										width: 48,
									}}
								/>
							)}
						</ListItemAvatar>

						<ListItemText
							primary={product.name}
							primaryTypographyProps={{ variant: "subtitle1" }}
							secondary={`${updatedPrefix} ${dayjs(product.updatedAt).format("DD/MM/YYYY HH:mm")}`}
							secondaryTypographyProps={{ variant: "body2" }}
						/>

						{!hideRowMenu && (
							<IconButton edge="end" aria-label="tác vụ">
								<DotsThreeVerticalIcon weight="bold" />
							</IconButton>
						)}
					</ListItem>
				))}
			</List>
		</Card>
	);
}

const statusMap = {
	pending: { label: "Tốt", color: "warning" as const },
	delivered: { label: "Xuất sắc", color: "success" as const },
	refunded: { label: "Cần cải thiện", color: "error" as const },
};

interface Order {
	id: string;
	customer?: { name: string };
	amount: number;
	createdAt: Date;
	status: "pending" | "delivered" | "refunded";
	statusText?: string;
	time?: string;
	xOffset?: number;
	yOffset?: number;
}

interface LatestOrdersProps {
	title?: string;
	orders?: Order[];
	sx?: SxProps;
	hideCustomer?: boolean;
	showScore?: boolean;
	showTime?: boolean;
	showOffsets?: boolean;
	orderHeader?: string;
	customerHeader?: string;
	dateHeader?: string;
	scoreHeader?: string;
	timeHeader?: string;
	xHeader?: string;
	yHeader?: string;
	statusHeader?: string;
}

function LatestOrders({
	title = "Điểm luyện tập",
	orders = [],
	sx,
	hideCustomer = false,
	showScore = false,
	showTime = false,
	showOffsets = false,
	orderHeader = "Mã phát",
	customerHeader = "Vận động viên",
	dateHeader = "Ngày",
	scoreHeader = "Số điểm",
	timeHeader = "Thời gian",
	xHeader = "Lệch X (mm)",
	yHeader = "Lệch Y (mm)",
	statusHeader = "Đánh giá",
}: LatestOrdersProps): React.JSX.Element {
	const minWidth =
		800 + (hideCustomer ? 0 : 160) + (showScore ? 120 : 0) + (showTime ? 140 : 0) + (showOffsets ? 220 : 0);

	return (
		<Card sx={sx}>
			<CardHeader title={title} />
			<Divider />
			<Box sx={{ overflowX: "auto" }}>
				<Table sx={{ minWidth }}>
					<TableHead>
						<TableRow>
							<TableCell>{orderHeader}</TableCell>
							{!hideCustomer && <TableCell>{customerHeader}</TableCell>}
							{showScore && <TableCell>{scoreHeader}</TableCell>}
							{showTime && <TableCell>{timeHeader}</TableCell>}
							{showOffsets && (
								<>
									<TableCell>{xHeader}</TableCell>
									<TableCell>{yHeader}</TableCell>
								</>
							)}
							<TableCell sortDirection="desc">{dateHeader}</TableCell>
							<TableCell>{statusHeader}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{orders.map((order) => {
							const map = statusMap[order.status] ?? { label: "Không xác định", color: "default" as const };
							const label = order.statusText ?? map.label;
							const color = map.color as any;

							return (
								<TableRow hover key={order.id}>
									<TableCell>{order.id}</TableCell>
									{!hideCustomer && <TableCell>{order.customer?.name ?? ""}</TableCell>}
									{showScore && <TableCell>{order.amount.toFixed(1)}</TableCell>}
									{showTime && <TableCell>{order.time ?? ""}</TableCell>}
									{showOffsets && (
										<>
											<TableCell>{order.xOffset !== undefined ? order.xOffset.toFixed(2) : ""}</TableCell>
											<TableCell>{order.yOffset !== undefined ? order.yOffset.toFixed(2) : ""}</TableCell>
										</>
									)}
									<TableCell>{dayjs(order.createdAt).format("MMM D, YYYY")}</TableCell>
									<TableCell>
										<Chip color={color} label={label} size="small" />
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Box>
		</Card>
	);
}

type ScoreSort = "none" | "score-desc" | "score-asc";

type RatingKey = "excellent" | "good" | "improve";
const ratingLabel: Record<RatingKey, string> = {
	excellent: "Xuất sắc",
	good: "Tốt",
	improve: "Cần cải thiện",
};
const ratingColor: Record<RatingKey, "success" | "warning" | "error"> = {
	excellent: "success",
	good: "warning",
	improve: "error",
};

type ReviewItem = { id: string; name: string; rating: RatingKey; note: string };

function CoachReviewCard({ items, onChange }: { items: ReviewItem[]; onChange: (next: ReviewItem[]) => void }) {
	const [editing, setEditing] = React.useState(false);
	const [draft, setDraft] = React.useState<ReviewItem[]>(items);

	React.useEffect(() => {
		if (!editing) setDraft(items);
	}, [items, editing]);

	const setDraftItem = (id: string, patch: Partial<ReviewItem>) =>
		setDraft((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

	return (
		<Card>
			<CardHeader title="Đánh giá chung của huấn luyện viên" />
			<Divider />
			<List>
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
										onChange={(e) => setDraftItem(it.id, { rating: e.target.value as RatingKey })}
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
										placeholder="Nhận xét chi tiết…"
										value={it.note}
										onChange={(e) => setDraftItem(it.id, { note: e.target.value })}
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
	const [sort, setSort] = React.useState<"newest" | "oldest">("newest");
	const [scoreSort, setScoreSort] = React.useState<ScoreSort>("none");
	const [date, setDate] = React.useState<string>(dayjs().format("YYYY-MM-DD"));
	const [search, setSearch] = React.useState<string>("");

	const [reviews, setReviews] = React.useState<ReviewItem[]>([
		{ id: "r1", name: "Tư thế ngắm", rating: "good", note: "Ổn định, cần giữ vai thả lỏng hơn cuối loạt." },
		{ id: "r2", name: "Kích hoạt cò", rating: "excellent", note: "Rất đều, hầu như không giật cò." },
		{
			id: "r3",
			name: "Theo dõi sau bắn",
			rating: "good",
			note: "Giữ ngắm 1–1.5s sau phát bắn, tránh hạ súng quá sớm.",
		},
		{
			id: "r4",
			name: "Nhịp thở",
			rating: "improve",
			note: "Chưa đồng bộ với thời điểm bóp cò, cần tập thêm bài nín thở 6s.",
		},
		{
			id: "r5",
			name: "Tập trung tinh thần",
			rating: "good",
			note: "Giữ nhịp tốt, tránh nhìn bảng điểm sau từng phát.",
		},
	]);

	const devices: Product[] = [
		{
			id: "DEV-005",
			name: "SIUS HS10 Electronic Target",
			image: "/assets/product-5.png",
			updatedAt: dayjs(date).hour(9).minute(10).toDate(),
		},
		{
			id: "DEV-004",
			name: "Feinwerkbau 800X (Air Rifle .177)",
			image: "/assets/product-4.png",
			updatedAt: dayjs(date).hour(9).minute(5).toDate(),
		},
		{
			id: "DEV-003",
			name: "SCATT MX-W2 Training System",
			image: "/assets/product-3.png",
			updatedAt: dayjs(date).hour(9).minute(0).toDate(),
		},
		{
			id: "DEV-002",
			name: "Jacket & Glove ISSF (Thick)",
			image: "/assets/product-2.png",
			updatedAt: dayjs(date).hour(8).minute(55).toDate(),
		},
		{
			id: "DEV-001",
			name: "Air Cylinder 200 bar",
			image: "/assets/product-1.png",
			updatedAt: dayjs(date).hour(8).minute(50).toDate(),
		},
	];

	const rawShots = [
		{ no: 1, score: 9.6, time: "49:48.00", x: 2.12, y: 2.68 },
		{ no: 2, score: 10.6, time: "50:38.07", x: -0.57, y: -0.73 },
		{ no: 3, score: 10.4, time: "51:23.07", x: -0.54, y: -1.3 },
		{ no: 4, score: 10.7, time: "52:03.72", x: 0.48, y: 0.88 },
		{ no: 5, score: 10.1, time: "52:50.98", x: 0.81, y: 1.28 },
		{ no: 6, score: 10.3, time: "53:41.03", x: -3.61, y: -0.83 },
		{ no: 7, score: 9.7, time: "54:31.34", x: 3.1, y: 0.57 },
		{ no: 8, score: 10.2, time: "55:24.63", x: -1.25, y: 1.12 },
		{ no: 9, score: 10.3, time: "56:24.78", x: -1.25, y: 1.12 },
		{ no: 10, score: 9.8, time: "57:21.15", x: -2.39, y: 1.45 },
		{ no: 11, score: 10.2, time: "58:11.67", x: -0.81, y: 1.63 },
	];

	const toLabel = (k: "delivered" | "pending" | "refunded") =>
		k === "delivered" ? "Xuất sắc" : k === "pending" ? "Tốt" : "Cần cải thiện";

	const orders: Order[] = React.useMemo(() => {
		let list: Order[] = rawShots.map((s, idx) => {
			const createdAt = dayjs(date)
				.hour(8)
				.minute(49)
				.add(idx * 2, "minute")
				.toDate();
			const statusKey = (s.score >= 10.5 ? "delivered" : s.score >= 9.5 ? "pending" : "refunded") as
				| "delivered"
				| "pending"
				| "refunded";
			return {
				id: `PHAT-${String(s.no).padStart(3, "0")}`,
				customer: { name: "NGUYEN VAN A" },
				amount: s.score,
				time: s.time,
				xOffset: s.x,
				yOffset: s.y,
				status: statusKey,
				statusText: toLabel(statusKey),
				createdAt,
			};
		});

		if (search.trim()) {
			const s = search.toLowerCase();
			list = list.filter((row) => row.id.toLowerCase().includes(s));
		}

		if (scoreSort === "score-desc") {
			list.sort((a, b) => b.amount - a.amount || b.createdAt.getTime() - a.createdAt.getTime());
		} else if (scoreSort === "score-asc") {
			list.sort((a, b) => a.amount - b.amount || b.createdAt.getTime() - a.createdAt.getTime());
		} else {
			list.sort((a, b) =>
				sort === "newest"
					? b.createdAt.getTime() - a.createdAt.getTime()
					: a.createdAt.getTime() - b.createdAt.getTime()
			);
		}

		return list;
	}, [date, search, sort, scoreSort]);

	return (
		<Grid container spacing={3}>
			<Grid size={{ xs: 12 }}>
				<Box
					sx={{
						display: "grid",
						gap: 2,
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
						label="Tìm kiếm (mã phát)"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						size="small"
					/>
					<TextField
						type="date"
						label="Ngày"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						InputLabelProps={{ shrink: true }}
						size="small"
					/>
					<TextField
						select
						label="Sắp xếp theo ngày"
						value={sort}
						onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
						size="small"
					>
						<MenuItem value="newest">Mới nhất</MenuItem>
						<MenuItem value="oldest">Cũ nhất</MenuItem>
					</TextField>
					<TextField
						select
						label="Sắp xếp theo điểm"
						value={scoreSort}
						onChange={(e) => setScoreSort(e.target.value as ScoreSort)}
						size="small"
					>
						<MenuItem value="none">Không</MenuItem>
						<MenuItem value="score-desc">Cao → Thấp</MenuItem>
						<MenuItem value="score-asc">Thấp → Cao</MenuItem>
					</TextField>
				</Box>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<CoachReviewCard items={reviews} onChange={setReviews} />
			</Grid>

			<Grid size={{ lg: 4, md: 6, xs: 12 }}>
				<LatestProducts title="Thiết bị đang sử dụng" products={devices} sx={{ height: "100%" }} />
			</Grid>

			<Grid size={{ lg: 8, md: 12, xs: 12 }}>
				<LatestOrders
					title="Điểm luyện tập"
					orders={orders}
					hideCustomer
					showScore
					showTime
					showOffsets
					orderHeader="Mã phát"
					dateHeader="Ngày"
					scoreHeader="Số điểm"
					timeHeader="Thời gian"
					xHeader="Lệch X (mm)"
					yHeader="Lệch Y (mm)"
					statusHeader="Đánh giá"
					sx={{ height: "100%" }}
				/>
			</Grid>
		</Grid>
	);
}
