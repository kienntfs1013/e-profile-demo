"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Eye } from "@phosphor-icons/react/dist/ssr/Eye";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";

export type Customer = {
	id: string;
	name: string;
	avatar?: string;
	email?: string;
	phone?: string;
	address?: {
		city?: string;
		country?: string;
		state?: string;
		street?: string;
	};
	createdAt?: Date;
	// bảng sẽ nhận thêm 2 field mở rộng nếu có
	age?: number;
	status?: "Đang hoạt động" | "Tạm ngưng";
};

export interface CustomersTableProps {
	rows?: Customer[];
	count?: number;
	page?: number;
	rowsPerPage?: number;
	onPageChange?: (event: unknown, newPage: number) => void;
	onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onEdit?: (row: Customer) => void;
	onDetail?: (row: Customer) => void;
	onDelete?: (row: Customer) => void;
}

export function CustomersTable(props: CustomersTableProps): React.JSX.Element {
	const {
		rows = [],
		count = 0,
		page = 0,
		rowsPerPage = 5,
		onPageChange,
		onRowsPerPageChange,
		onEdit,
		onDetail,
		onDelete,
	} = props;

	return (
		<Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
			<TableContainer>
				<Table sx={{ minWidth: 900 }}>
					<TableHead>
						<TableRow>
							<TableCell>Vận động viên</TableCell>
							<TableCell align="center">Tuổi</TableCell>
							<TableCell>Địa chỉ</TableCell>
							<TableCell>SĐT</TableCell>
							<TableCell align="center">Trạng thái</TableCell>
							<TableCell align="right">Thao tác</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row) => {
							const addr = [row.address?.street, row.address?.city, row.address?.state].filter(Boolean).join(", ");

							return (
								<TableRow hover key={row.id}>
									<TableCell>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<Avatar src={row.avatar} />
											<Box>
												<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
													{row.name}
												</Typography>
												{row.email ? (
													<Typography variant="caption" color="text.secondary">
														{row.email}
													</Typography>
												) : null}
											</Box>
										</Stack>
									</TableCell>

									<TableCell align="center">{row.age ?? "-"}</TableCell>

									<TableCell>
										<Typography variant="body2">{addr || "-"}</Typography>
									</TableCell>

									<TableCell>
										<Typography variant="body2">{row.phone || "-"}</Typography>
									</TableCell>

									<TableCell align="center">
										<Chip
											size="small"
											label={row.status ?? "Đang hoạt động"}
											color={(row.status === "Đang hoạt động" ? "success" : "default") as any}
											variant={row.status === "Đang hoạt động" ? "filled" : "outlined"}
										/>
									</TableCell>

									<TableCell align="right">
										<Stack direction="row" spacing={0.5} justifyContent="flex-end">
											<Tooltip title="Chi tiết">
												<IconButton onClick={() => onDetail?.(row)} size="small">
													<Eye />
												</IconButton>
											</Tooltip>
											<Tooltip title="Sửa">
												<IconButton onClick={() => onEdit?.(row)} size="small">
													<PencilSimple />
												</IconButton>
											</Tooltip>
											<Tooltip title="Xóa">
												<IconButton color="error" onClick={() => onDelete?.(row)} size="small">
													<Trash />
												</IconButton>
											</Tooltip>
										</Stack>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				component="div"
				count={count}
				page={page}
				onPageChange={onPageChange as any}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={onRowsPerPageChange}
				rowsPerPageOptions={[5, 10, 25]}
			/>
		</Paper>
	);
}
