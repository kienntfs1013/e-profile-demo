"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/models/user";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";
import dayjs from "dayjs";

import "dayjs/locale/vi";

dayjs.locale("vi");

export interface Product {
	id: string;
	image: string;
	name: string;
	updatedAt: Date;
}

export interface LatestProductsProps {
	products?: Product[];
	sx?: SxProps;
	title?: string;
	updatedPrefix?: string;
	hideRowMenu?: boolean;
	onAdd?: () => void;
	onEditItem?: (p: Product) => void;
	onDeleteItem?: (p: Product) => void;
}

function LatestProducts({
	products = [],
	sx,
	title = "Thiết bị đang sử dụng",
	updatedPrefix = "Cập nhật",
	hideRowMenu = false,
	onAdd,
	onEditItem,
	onDeleteItem,
}: LatestProductsProps): React.JSX.Element {
	return (
		<Card sx={{ ...sx, minWidth: 0 }}>
			<CardHeader
				title={title}
				action={
					<Button onClick={onAdd} startIcon={<Plus />} size="small" variant="contained">
						Thêm mới
					</Button>
				}
			/>
			<Divider />
			<List sx={{ py: 0 }}>
				{products.map((product, index) => (
					<ListItem
						key={product.id}
						divider={index < products.length - 1}
						alignItems="center"
						sx={{ pr: { xs: 10, sm: 12 } }}
						secondaryAction={
							!hideRowMenu ? (
								<Stack
									direction="row"
									spacing={1.25}
									sx={{ mr: 0.5, minWidth: 96, justifyContent: "flex-end", alignItems: "center" }}
								>
									<IconButton aria-label="sửa" size="small" onClick={() => onEditItem?.(product)}>
										<PencilSimple />
									</IconButton>
									<IconButton aria-label="xóa" size="small" color="error" onClick={() => onDeleteItem?.(product)}>
										<Trash />
									</IconButton>
								</Stack>
							) : undefined
						}
					>
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
									sx={{ borderRadius: 1, backgroundColor: "var(--mui-palette-neutral-200)", height: 48, width: 48 }}
								/>
							)}
						</ListItemAvatar>
						<ListItemText
							primary={product.name}
							secondary={`${updatedPrefix} ${dayjs(product.updatedAt).format("DD/MM/YYYY HH:mm")}`}
							primaryTypographyProps={{ variant: "subtitle1", noWrap: true }}
							secondaryTypographyProps={{ variant: "body2", noWrap: true }}
							sx={{ mr: 1, minWidth: 0, "& .MuiListItemText-primary": { fontWeight: 500 } }}
						/>
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

export interface Order {
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

export interface LatestOrdersProps {
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
	onAdd?: () => void;
	onEditRow?: (o: Order) => void;
	onDeleteRow?: (o: Order) => void;
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
	onAdd,
	onEditRow,
	onDeleteRow,
}: LatestOrdersProps): React.JSX.Element {
	const minWidth =
		800 + (hideCustomer ? 0 : 160) + (showScore ? 120 : 0) + (showTime ? 140 : 0) + (showOffsets ? 220 : 0) + 160;

	return (
		<Card sx={{ ...sx, minWidth: 0 }}>
			<CardHeader
				title={title}
				action={
					<Button onClick={onAdd} startIcon={<Plus />} size="small" variant="contained">
						Thêm mới
					</Button>
				}
			/>
			<Divider />
			<Box sx={{ overflowX: "auto", width: "100%" }}>
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
							<TableCell align="right">Thao tác</TableCell>
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
									<TableCell align="right">
										<IconButton aria-label="sửa" size="small" onClick={() => onEditRow?.(order)}>
											<PencilSimple />
										</IconButton>
										<IconButton aria-label="xóa" size="small" color="error" onClick={() => onDeleteRow?.(order)}>
											<Trash />
										</IconButton>
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

/* ====== ĐÁNH GIÁ CỦA HLV ====== */
type RatingKey = "excellent" | "good" | "improve";
type ReviewItem = { id: string; name: string; rating: RatingKey; note: string };

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

function CoachReviewCard({ items, onChange }: { items: ReviewItem[]; onChange: (next: ReviewItem[]) => void }) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState<ReviewItem[]>(items);

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
							<Button variant="outlined" onClick={() => setEditing(false)}>
								Hủy
							</Button>
							<Button
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
										placeholder="Nhận xét chi tiết…"
										value={it.note}
										onChange={(e) => setItem(it.id, { note: e.target.value })}
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
/* ====== /ĐÁNH GIÁ CỦA HLV ====== */

export function TrainingSection({ user }: { user: User }) {
	const router = useRouter();
	const [sort, setSort] = useState<"newest" | "oldest">("newest");
	const [scoreSort, setScoreSort] = useState<"none" | "asc" | "desc">("none");
	const [date, setDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
	const [search, setSearch] = useState<string>("");

	const initialDevices: Product[] = [
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
	const [deviceList, setDeviceList] = useState<Product[]>(initialDevices);

	type Shot = { id: string; amount: number; time: string; x: number; y: number };
	const initialShots: Shot[] = [
		{ id: "PHAT-001", amount: 9.6, time: "49:48.00", x: 2.12, y: 2.68 },
		{ id: "PHAT-002", amount: 10.6, time: "50:38.07", x: -0.57, y: -0.73 },
		{ id: "PHAT-003", amount: 10.4, time: "51:23.07", x: -0.54, y: -1.3 },
		{ id: "PHAT-004", amount: 10.7, time: "52:03.72", x: 0.48, y: 0.88 },
		{ id: "PHAT-005", amount: 10.1, time: "52:50.98", x: 0.81, y: 1.28 },
		{ id: "PHAT-006", amount: 10.3, time: "53:41.03", x: -3.61, y: -0.83 },
		{ id: "PHAT-007", amount: 9.7, time: "54:31.34", x: 3.1, y: 0.57 },
		{ id: "PHAT-008", amount: 10.2, time: "55:24.63", x: -1.25, y: 1.12 },
		{ id: "PHAT-009", amount: 10.3, time: "56:24.78", x: -1.25, y: 1.12 },
		{ id: "PHAT-010", amount: 9.8, time: "57:21.15", x: -2.39, y: 1.45 },
		{ id: "PHAT-011", amount: 10.2, time: "58:11.67", x: -0.81, y: 1.63 },
	];
	const [shots, setShots] = useState<Shot[]>(initialShots);

	const orders: Order[] = shots
		.map((s, idx) => {
			const createdAt = dayjs(date)
				.hour(8)
				.minute(49)
				.add(idx * 2, "minute")
				.toDate();
			const statusKey = (s.amount >= 10.5 ? "delivered" : s.amount >= 9.5 ? "pending" : "refunded") as
				| "delivered"
				| "pending"
				| "refunded";
			return {
				id: s.id,
				customer: { name: user?.name ?? "ATHLETE" },
				amount: s.amount,
				time: s.time,
				xOffset: s.x,
				yOffset: s.y,
				status: statusKey,
				statusText: statusKey === "delivered" ? "Xuất sắc" : statusKey === "pending" ? "Tốt" : "Cần cải thiện",
				createdAt,
			};
		})
		.filter((row) => (search.trim() ? row.id.toLowerCase().includes(search.toLowerCase()) : true))
		.sort((a, b) => {
			if (scoreSort !== "none") return scoreSort === "desc" ? b.amount - a.amount : a.amount - b.amount;
			return sort === "newest"
				? b.createdAt.getTime() - a.createdAt.getTime()
				: a.createdAt.getTime() - b.createdAt.getTime();
		});

	const [confirmProduct, setConfirmProduct] = useState<Product | null>(null);
	const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);

	const handleAddDevice = () =>
		router.push(`/dashboard/customers/training/devices/add?athlete=${encodeURIComponent(user.id)}`);
	const handleEditDevice = (p: Product) =>
		router.push(
			`/dashboard/customers/training/devices/update/${encodeURIComponent(p.id)}?athlete=${encodeURIComponent(user.id)}&name=${encodeURIComponent(
				p.name
			)}&image=${encodeURIComponent(p.image || "")}&updatedAt=${encodeURIComponent(p.updatedAt.toISOString())}`
		);
	const handleDeleteDevice = (p: Product) => setConfirmProduct(p);

	const handleAddShot = () =>
		router.push(`/dashboard/customers/training/shots/add?athlete=${encodeURIComponent(user.id)}`);
	const handleEditShot = (o: Order) =>
		router.push(
			`/dashboard/customers/training/shots/update/${encodeURIComponent(o.id)}?athlete=${encodeURIComponent(user.id)}&score=${o.amount}&time=${encodeURIComponent(
				o.time || ""
			)}&x=${o.xOffset ?? ""}&y=${o.yOffset ?? ""}&date=${encodeURIComponent(o.createdAt.toISOString())}&status=${o.status}`
		);
	const handleDeleteShot = (o: Order) => setConfirmOrder(o);

	const confirmDeleteDevice = () => {
		if (confirmProduct) setDeviceList((prev) => prev.filter((d) => d.id !== confirmProduct.id));
		setConfirmProduct(null);
	};
	const confirmDeleteShot = () => {
		if (confirmOrder) setShots((prev) => prev.filter((s) => s.id !== confirmOrder.id));
		setConfirmOrder(null);
	};

	const [reviews, setReviews] = useState<ReviewItem[]>([
		{ id: "r1", name: "Tư thế ngắm", rating: "good", note: "Ổn định, giữ vai thả lỏng tốt." },
		{ id: "r2", name: "Kích hoạt cò", rating: "excellent", note: "Đều, không giật cò." },
		{ id: "r3", name: "Theo dõi sau bắn", rating: "good", note: "Giữ ngắm 1–1.5s sau phát bắn." },
		{ id: "r4", name: "Nhịp thở", rating: "improve", note: "Chưa đồng bộ; luyện nín thở 6s." },
		{ id: "r5", name: "Tập trung tinh thần", rating: "good", note: "Tránh xem điểm sau từng phát." },
	]);

	return (
		<Stack spacing={3}>
			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={2}
				alignItems={{ xs: "stretch", md: "center" }}
				sx={{ width: "100%" }}
			>
				<TextField
					fullWidth
					label="Tìm kiếm (mã phát)"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					size="small"
					sx={{ flex: { md: 1 } }}
				/>
				<TextField
					type="date"
					label="Ngày"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					size="small"
					sx={{ width: { xs: "100%", md: 220 } }}
				/>
				<TextField
					select
					label="Sắp xếp thời gian"
					value={sort}
					onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
					size="small"
					sx={{ width: { xs: "100%", md: 200 } }}
				>
					<MenuItem value="newest">Mới nhất</MenuItem>
					<MenuItem value="oldest">Cũ nhất</MenuItem>
				</TextField>
				<TextField
					select
					label="Sắp xếp điểm"
					value={scoreSort}
					onChange={(e) => setScoreSort(e.target.value as "none" | "asc" | "desc")}
					size="small"
					sx={{ width: { xs: "100%", md: 200 } }}
				>
					<MenuItem value="none">Không sắp xếp</MenuItem>
					<MenuItem value="desc">Cao → Thấp</MenuItem>
					<MenuItem value="asc">Thấp → Cao</MenuItem>
				</TextField>
			</Stack>

			<CoachReviewCard items={reviews} onChange={setReviews} />

			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					gap: 3,
					alignItems: "stretch",
					width: "100%",
				}}
			>
				<Box
					sx={{
						flexBasis: { xs: "100%", md: "32%" },
						maxWidth: { xs: "100%", md: "32%" },
						flexGrow: { xs: 0, md: 0 },
						flexShrink: 1,
						minWidth: 0,
					}}
				>
					<LatestProducts
						title="Thiết bị đang sử dụng"
						products={deviceList}
						sx={{ height: "100%" }}
						onAdd={handleAddDevice}
						onEditItem={handleEditDevice}
						onDeleteItem={handleDeleteDevice}
					/>
				</Box>

				<Box
					sx={{
						flexBasis: { xs: "100%", md: "68%" },
						maxWidth: { xs: "100%", md: "68%" },
						flexGrow: 1,
						flexShrink: 1,
						minWidth: 0,
					}}
				>
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
						onAdd={handleAddShot}
						onEditRow={handleEditShot}
						onDeleteRow={handleDeleteShot}
					/>
				</Box>
			</Box>

			<Dialog open={!!confirmProduct} onClose={() => setConfirmProduct(null)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa thiết bị</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Bạn có chắc muốn xóa thiết bị{confirmProduct ? ` “${confirmProduct.name}” (Mã: ${confirmProduct.id})` : ""}?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" onClick={() => setConfirmProduct(null)}>
						Hủy
					</Button>
					<Button color="error" variant="contained" onClick={confirmDeleteDevice}>
						Đồng ý
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={!!confirmOrder} onClose={() => setConfirmOrder(null)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa phát bắn</DialogTitle>
				<DialogContent>
					<DialogContentText>Bạn có chắc muốn xóa phát {confirmOrder?.id ?? ""}?</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" onClick={() => setConfirmOrder(null)}>
						Hủy
					</Button>
					<Button color="error" variant="contained" onClick={confirmDeleteShot}>
						Đồng ý
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}
