"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { users as seedUsers, type User } from "@/models/user";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Eye } from "@phosphor-icons/react/dist/ssr/Eye";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";

function applyPagination<T>(rows: T[], page: number, rowsPerPage: number): T[] {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export default function CustomersPage(): React.JSX.Element {
	const router = useRouter();

	const [data, setData] = React.useState<User[]>(seedUsers);
	const [search, setSearch] = React.useState("");
	const [status, setStatus] = React.useState<"all" | "active" | "paused">("all");
	const [sport, setSport] = React.useState<"shooting" | "archery" | "taekwondo" | "boxing">("shooting");
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

	const [confirmUser, setConfirmUser] = React.useState<User | null>(null);

	const filtered = React.useMemo(() => {
		const q = search.trim().toLowerCase();
		const base = data.filter((u) => u.role === "Vận động viên");
		return base.filter((u) => {
			const okName = q ? u.name.toLowerCase().includes(q) : true;
			const okStatus =
				status === "all" ? true : status === "active" ? u.status === "Đang hoạt động" : u.status === "Tạm ngưng";
			return okName && okStatus;
		});
	}, [data, search, status]);

	const rows = React.useMemo(() => applyPagination(filtered, page, rowsPerPage), [filtered, page, rowsPerPage]);

	const goDetail = (id: string) => router.push(`/dashboard/customers/${id}`);

	const onRequestDelete = (u: User) => setConfirmUser(u);
	const onCancelDelete = () => setConfirmUser(null);
	const onConfirmDelete = () => {
		if (confirmUser) {
			setData((prev) => prev.filter((x) => x.id !== confirmUser.id));
			setConfirmUser(null);
		}
	};

	return (
		<Stack spacing={3}>
			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={2}
				alignItems={{ xs: "stretch", md: "center" }}
				justifyContent="space-between"
			>
				<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1, minWidth: 0 }}>
					<Box sx={{ flex: 1, minWidth: 240 }}>
						<TextField
							fullWidth
							size="small"
							label="Tìm kiếm theo tên"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(0);
							}}
						/>
					</Box>

					<Box sx={{ width: { xs: "100%", sm: 260 } }}>
						<TextField
							select
							fullWidth
							size="small"
							label="Bộ môn"
							value={sport}
							onChange={(e) => {
								setSport(e.target.value as "shooting" | "archery" | "taekwondo" | "boxing");
								setPage(0);
							}}
						>
							<MenuItem value="shooting">Bắn súng</MenuItem>
							<MenuItem value="archery">Bắn cung</MenuItem>
							<MenuItem value="taekwondo">Taekwondo</MenuItem>
							<MenuItem value="boxing">Boxing</MenuItem>
						</TextField>
					</Box>

					<Box sx={{ width: { xs: "100%", sm: 260 } }}>
						<TextField
							select
							fullWidth
							size="small"
							label="Trạng thái"
							value={status}
							onChange={(e) => {
								setStatus(e.target.value as "all" | "active" | "paused");
								setPage(0);
							}}
						>
							<MenuItem value="all">Tất cả</MenuItem>
							<MenuItem value="active">Đang hoạt động</MenuItem>
							<MenuItem value="paused">Tạm ngưng</MenuItem>
						</TextField>
					</Box>
				</Stack>

				<Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
					<Button
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
						onClick={() => router.push("/dashboard/customers/add")}
					>
						Thêm mới
					</Button>
				</Box>
			</Stack>

			<Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
				<TableContainer>
					<Table sx={{ minWidth: 900 }}>
						<TableHead>
							<TableRow>
								<TableCell>Vận động viên</TableCell>
								<TableCell align="center">Tuổi</TableCell>
								<TableCell>Email</TableCell>
								<TableCell>SĐT</TableCell>
								<TableCell align="center">Trạng thái</TableCell>
								<TableCell align="right">Thao tác</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{rows.map((row: User) => {
								const addr = [row.address?.street, row.address?.city, row.address?.state].filter(Boolean).join(", ");

								return (
									<TableRow key={row.id} hover onClick={() => goDetail(row.id)} sx={{ cursor: "pointer" }}>
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
											<Typography variant="body2">{row.email || "-"}</Typography>
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

										<TableCell align="right" onClick={(e) => e.stopPropagation()}>
											<Stack direction="row" spacing={0.5} justifyContent="flex-end">
												<Tooltip title="Chi tiết">
													<IconButton size="small" onClick={() => goDetail(row.id)}>
														<Eye />
													</IconButton>
												</Tooltip>
												<Tooltip title="Sửa">
													<IconButton size="small" onClick={() => router.push(`/dashboard/customers/update/${row.id}`)}>
														<PencilSimple />
													</IconButton>
												</Tooltip>
												<Tooltip title="Xóa">
													<IconButton size="small" color="error" onClick={() => onRequestDelete(row)}>
														<Trash />
													</IconButton>
												</Tooltip>
											</Stack>
										</TableCell>
									</TableRow>
								);
							})}

							{rows.length === 0 && (
								<TableRow>
									<TableCell colSpan={6}>
										<Box p={3} textAlign="center" color="text.secondary">
											Không có dữ liệu
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>

				<TablePagination
					component="div"
					count={filtered.length}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={(_, newPage) => setPage(newPage)}
					onRowsPerPageChange={(e) => {
						setRowsPerPage(parseInt(e.target.value, 10));
						setPage(0);
					}}
					rowsPerPageOptions={[5, 10, 25]}
					labelRowsPerPage="Dòng / trang"
				/>
			</Paper>

			<Dialog open={!!confirmUser} onClose={onCancelDelete} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Bạn có chắc muốn xóa vận động viên
						{confirmUser ? ` “${confirmUser.name}” (Mã: ${confirmUser.id})` : ""} khỏi danh sách?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={onCancelDelete} variant="outlined">
						Hủy
					</Button>
					<Button onClick={onConfirmDelete} color="error" variant="contained">
						Đồng ý
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}
