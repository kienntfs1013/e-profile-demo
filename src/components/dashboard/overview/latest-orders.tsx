import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import type { SxProps } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import dayjs from "dayjs";

const statusMap = {
	pending: { label: "Tốt", color: "warning" as const },
	delivered: { label: "Xuất sắc", color: "success" as const },
	refunded: { label: "Cần cải thiện", color: "error" as const },
};

export interface Order {
	id: string; // Mã phát
	customer?: { name: string }; // Sẽ ẩn nếu hideCustomer = true
	amount: number; // Số điểm
	createdAt: Date; // Ngày
	status: "pending" | "delivered" | "refunded";
	statusText?: string; // Nhãn đánh giá tùy biến (nếu muốn override)
	time?: string; // Thời gian bắn: "49:48.00"
	xOffset?: number; // Lệch X (mm)
	yOffset?: number; // Lệch Y (mm)
}

export interface LatestOrdersProps {
	title?: string;

	orders?: Order[];
	sx?: SxProps;

	// Tùy chọn hiển thị cột
	hideCustomer?: boolean;
	showScore?: boolean;
	showTime?: boolean;
	showOffsets?: boolean;

	// Việt hoá tiêu đề cột
	orderHeader?: string; // Mặc định: "Mã phát"
	customerHeader?: string; // Mặc định: "Vận động viên"
	dateHeader?: string; // Mặc định: "Ngày"
	scoreHeader?: string; // Mặc định: "Số điểm"
	timeHeader?: string; // Mặc định: "Thời gian"
	xHeader?: string; // Mặc định: "Lệch X (mm)"
	yHeader?: string; // Mặc định: "Lệch Y (mm)"
	statusHeader?: string; // Mặc định: "Đánh giá"
}

export function LatestOrders({
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
	// tăng minWidth khi có nhiều cột
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
			<Divider />
			<CardActions sx={{ justifyContent: "flex-end" }}>
				<Button
					color="inherit"
					endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
					size="small"
					variant="text"
				>
					Xem tất cả
				</Button>
			</CardActions>
		</Card>
	);
}
