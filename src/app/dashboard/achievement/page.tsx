"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	listArcheryCompetitionsByAthlete,
	listBoxingCompetitionsByAthlete,
	listShootingCompetitionsByAthlete,
	listTaekwondoCompetitionsByAthlete,
	type ArcheryCompetitionDTO,
	type BoxingCompetitionDTO,
	type ShootingCompetitionDTO,
	type TaekwondoCompetitionDTO,
} from "@/services/competition.service";
import { fetchUserByIdFromList, getLoggedInUserId } from "@/services/user.service";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import dayjs from "dayjs";

import "dayjs/locale/vi";

dayjs.locale("vi");

type SportKey = "shooting" | "archery" | "boxing" | "taekwondo";
type Row = ArcheryCompetitionDTO | BoxingCompetitionDTO | ShootingCompetitionDTO | TaekwondoCompetitionDTO;

function SectionCard({
	title,
	header,
	children,
	sx,
}: {
	title: string;
	header?: React.ReactNode;
	children: React.ReactNode;
	sx?: SxProps;
}) {
	return (
		<Card sx={{ ...sx, minWidth: 0 }}>
			<CardHeader title={title} action={header} />
			<Divider />
			<Box sx={{ overflowX: "auto", width: "100%" }}>{children}</Box>
		</Card>
	);
}

function parseResult(v?: string) {
	if (!v) return "—";
	try {
		const o = JSON.parse(v);
		if (o && typeof o === "object") {
			return Object.entries(o)
				.slice(0, 4)
				.map(([k, val]) => `${k}: ${val}`)
				.join(", ");
		}
	} catch {}
	return v;
}

export default function Page() {
	const router = useRouter();

	const [sort, setSort] = React.useState<"newest" | "oldest">("newest");
	const [search, setSearch] = React.useState<string>("");
	const [date, setDate] = React.useState<string>("");

	const [arch, setArch] = React.useState<ArcheryCompetitionDTO[]>([]);
	const [shoot, setShoot] = React.useState<ShootingCompetitionDTO[]>([]);
	const [box, setBox] = React.useState<BoxingCompetitionDTO[]>([]);
	const [tkd, setTkd] = React.useState<TaekwondoCompetitionDTO[]>([]);

	const [loading, setLoading] = React.useState(false);
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

	const [athleteId, setAthleteId] = React.useState<number | undefined>(undefined);
	const [sportKey, setSportKey] = React.useState<SportKey | "">("");

	React.useEffect(() => {
		let cancelled = false;
		async function loadUser() {
			const uid = getLoggedInUserId();
			if (!uid) return;
			const user = await fetchUserByIdFromList(uid);
			if (cancelled || !user) return;

			setAthleteId(Number(user.id));
			const s = String(user.sport || "")
				.toLowerCase()
				.trim();
			if (s === "shooting" || s.includes("bắn súng")) setSportKey("shooting");
			else if (s === "archery" || s.includes("bắn cung")) setSportKey("archery");
			else if (s === "taekwondo") setSportKey("taekwondo");
			else if (s === "boxing") setSportKey("boxing");
			else setSportKey("");
		}
		loadUser();
		return () => {
			cancelled = true;
		};
	}, []);

	React.useEffect(() => {
		let cancelled = false;
		async function load() {
			if (!athleteId) return;
			setLoading(true);
			try {
				if (sportKey === "archery") {
					const r = await listArcheryCompetitionsByAthlete(athleteId, "id-desc");
					if (!cancelled) setArch(r);
				} else if (sportKey === "shooting") {
					const r = await listShootingCompetitionsByAthlete(athleteId, "id-desc");
					if (!cancelled) setShoot(r);
				} else if (sportKey === "boxing") {
					const r = await listBoxingCompetitionsByAthlete(athleteId, "id-desc");
					if (!cancelled) setBox(r);
				} else if (sportKey === "taekwondo") {
					const r = await listTaekwondoCompetitionsByAthlete(athleteId, "id-desc");
					if (!cancelled) setTkd(r);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [athleteId, sportKey]);

	React.useEffect(() => {
		setPage(0);
	}, [sportKey, search, sort, date]);

	const matchDate = (iso?: string) => {
		if (!date) return true;
		if (!iso) return false;
		return dayjs(iso).format("YYYY-MM-DD") === date;
	};

	const applySortFilter = <T extends { created_at?: string; recorded_at?: string }>(arr: T[]) => {
		const filtered = arr.filter((r) => matchDate(r.recorded_at || r.created_at));
		const sorted = [...filtered].sort((a, b) => {
			const da = a.created_at || a.recorded_at || "";
			const db = b.created_at || b.recorded_at || "";
			return sort === "newest" ? db.localeCompare(da) : da.localeCompare(db);
		});
		const q = search.trim().toLowerCase();
		if (!q) return sorted;
		return sorted.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
	};

	const paginate = <T,>(rows: T[]) => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	const handleAdd = () => {
		if (!athleteId || !sportKey) return;
		router.push(`/dashboard/customers/achievements/${sportKey}/add?athlete=${athleteId}`);
	};

	const handleEdit = (id: number | string) => {
		if (!athleteId || !sportKey) return;
		router.push(`/dashboard/customers/achievements/${sportKey}/update/${id}?athlete=${athleteId}`);
	};

	return (
		<Stack spacing={3}>
			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={2}
				alignItems={{ xs: "stretch", md: "stretch" }}
				sx={{ width: "100%" }}
			>
				<TextField
					fullWidth
					label="Tìm kiếm (theo nội dung)"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					size="small"
					sx={{ flex: { md: 1 } }}
				/>
				<Stack direction="row" spacing={1.5} sx={{ width: { xs: "100%", md: "auto" } }}>
					<TextField
						type="date"
						label="Ngày"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						InputLabelProps={{ shrink: true }}
						size="small"
						sx={{ width: { xs: "100%", md: 220 } }}
					/>
					<Button
						variant="outlined"
						onClick={() => setDate("")}
						sx={{ height: 40, minWidth: 100, whiteSpace: "nowrap" }}
					>
						Xóa ngày
					</Button>
				</Stack>
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
			</Stack>

			{sportKey === "archery" && (
				<SectionCard
					title="Bắn cung — Thành tích thi đấu"
					header={
						<Button onClick={handleAdd} startIcon={<Plus />} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
					<Table sx={{ minWidth: 1100 }}>
						<TableHead>
							<TableRow>
								<TableCell>Mã</TableCell>
								<TableCell>Giải đấu</TableCell>
								<TableCell>Huy chương</TableCell>
								<TableCell>Hạng</TableCell>
								<TableCell>Kết quả</TableCell>
								<TableCell>Ghi chú</TableCell>
								<TableCell>Ngày ghi nhận</TableCell>
								<TableCell align="right">Sửa</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginate(applySortFilter(arch)).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.id}</TableCell>
									<TableCell>{r.competition_id ?? "—"}</TableCell>
									<TableCell>{r.medal_won ?? "—"}</TableCell>
									<TableCell>{r.final_rank != null ? <Chip size="small" label={r.final_rank} /> : "—"}</TableCell>
									<TableCell>{parseResult(r.result_data)}</TableCell>
									<TableCell>{r.notes || "—"}</TableCell>
									<TableCell>
										{r.recorded_at
											? dayjs(r.recorded_at).format("DD/MM/YYYY")
											: r.created_at
												? dayjs(r.created_at).format("DD/MM/YYYY")
												: "—"}
									</TableCell>
									<TableCell align="right">
										<IconButton size="small" onClick={() => handleEdit(r.id)}>
											<PencilSimple />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{!loading && arch.length === 0 && (
								<TableRow>
									<TableCell colSpan={8}>
										<Box p={2} textAlign="center" color="text.secondary">
											Không có dữ liệu
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					<TablePagination
						component="div"
						count={applySortFilter(arch).length}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={(_, p) => setPage(p)}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
						rowsPerPageOptions={[5, 10, 25]}
						labelRowsPerPage="Dòng / trang"
					/>
				</SectionCard>
			)}

			{sportKey === "shooting" && (
				<SectionCard
					title="Bắn súng — Thành tích thi đấu"
					header={
						<Button onClick={handleAdd} startIcon={<Plus />} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
					<Table sx={{ minWidth: 1100 }}>
						<TableHead>
							<TableRow>
								<TableCell>Mã</TableCell>
								<TableCell>Giải đấu</TableCell>
								<TableCell>Huy chương</TableCell>
								<TableCell>Hạng</TableCell>
								<TableCell>Kết quả</TableCell>
								<TableCell>Ghi chú</TableCell>
								<TableCell>Ngày tạo</TableCell>
								<TableCell align="right">Sửa</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginate(applySortFilter(shoot)).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.id}</TableCell>
									<TableCell>{r.competition_id ?? "—"}</TableCell>
									<TableCell>{r.medal_won ?? "—"}</TableCell>
									<TableCell>{r.final_rank != null ? <Chip size="small" label={r.final_rank} /> : "—"}</TableCell>
									<TableCell>{parseResult(r.result_data)}</TableCell>
									<TableCell>{r.notes || "—"}</TableCell>
									<TableCell>{r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY") : "—"}</TableCell>
									<TableCell align="right">
										<IconButton size="small" onClick={() => handleEdit(r.id)}>
											<PencilSimple />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{!loading && shoot.length === 0 && (
								<TableRow>
									<TableCell colSpan={8}>
										<Box p={2} textAlign="center" color="text.secondary">
											Không có dữ liệu
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					<TablePagination
						component="div"
						count={applySortFilter(shoot).length}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={(_, p) => setPage(p)}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
						rowsPerPageOptions={[5, 10, 25]}
						labelRowsPerPage="Dòng / trang"
					/>
				</SectionCard>
			)}

			{sportKey === "boxing" && (
				<SectionCard
					title="Boxing — Thành tích thi đấu"
					header={
						<Button onClick={handleAdd} startIcon={<Plus />} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
					<Table sx={{ minWidth: 1100 }}>
						<TableHead>
							<TableRow>
								<TableCell>Mã</TableCell>
								<TableCell>Giải đấu</TableCell>
								<TableCell>Huy chương</TableCell>
								<TableCell>Hạng</TableCell>
								<TableCell>Kết quả</TableCell>
								<TableCell>Ghi chú</TableCell>
								<TableCell>Ngày tạo</TableCell>
								<TableCell align="right">Sửa</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginate(applySortFilter(box)).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.id}</TableCell>
									<TableCell>{r.competition_id ?? "—"}</TableCell>
									<TableCell>{r.medal_won ?? "—"}</TableCell>
									<TableCell>{r.final_rank != null ? <Chip size="small" label={r.final_rank} /> : "—"}</TableCell>
									<TableCell>{parseResult(r.result_data)}</TableCell>
									<TableCell>{r.notes || "—"}</TableCell>
									<TableCell>{r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY") : "—"}</TableCell>
									<TableCell align="right">
										<IconButton size="small" onClick={() => handleEdit(r.id)}>
											<PencilSimple />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{!loading && box.length === 0 && (
								<TableRow>
									<TableCell colSpan={8}>
										<Box p={2} textAlign="center" color="text.secondary">
											Không có dữ liệu
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					<TablePagination
						component="div"
						count={applySortFilter(box).length}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={(_, p) => setPage(p)}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
						rowsPerPageOptions={[5, 10, 25]}
						labelRowsPerPage="Dòng / trang"
					/>
				</SectionCard>
			)}

			{sportKey === "taekwondo" && (
				<SectionCard
					title="Taekwondo — Thành tích thi đấu"
					header={
						<Button onClick={handleAdd} startIcon={<Plus />} size="small" variant="contained">
							Thêm mới
						</Button>
					}
				>
					<Table sx={{ minWidth: 1100 }}>
						<TableHead>
							<TableRow>
								<TableCell>Mã</TableCell>
								<TableCell>Giải đấu</TableCell>
								<TableCell>Huy chương</TableCell>
								<TableCell>Hạng</TableCell>
								<TableCell>Kết quả</TableCell>
								<TableCell>Ghi chú</TableCell>
								<TableCell>Ngày ghi nhận</TableCell>
								<TableCell align="right">Sửa</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginate(applySortFilter(tkd)).map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>{r.id}</TableCell>
									<TableCell>{r.competition_id ?? "—"}</TableCell>
									<TableCell>{r.medal_won ?? "—"}</TableCell>
									<TableCell>{r.final_rank != null ? <Chip size="small" label={r.final_rank} /> : "—"}</TableCell>
									<TableCell>{parseResult(r.result_data)}</TableCell>
									<TableCell>{r.notes || "—"}</TableCell>
									<TableCell>
										{r.recorded_at
											? dayjs(r.recorded_at).format("DD/MM/YYYY")
											: r.created_at
												? dayjs(r.created_at).format("DD/MM/YYYY")
												: "—"}
									</TableCell>
									<TableCell align="right">
										<IconButton size="small" onClick={() => handleEdit(r.id)}>
											<PencilSimple />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{!loading && tkd.length === 0 && (
								<TableRow>
									<TableCell colSpan={8}>
										<Box p={2} textAlign="center" color="text.secondary">
											Không có dữ liệu
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					<TablePagination
						component="div"
						count={applySortFilter(tkd).length}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={(_, p) => setPage(p)}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
						rowsPerPageOptions={[5, 10, 25]}
						labelRowsPerPage="Dòng / trang"
					/>
				</SectionCard>
			)}

			{!sportKey && (
				<Box p={2} textAlign="center" color="text.secondary" border="1px dashed" borderRadius={1.5}>
					Không xác định bộ môn của vận động viên.
				</Box>
			)}
		</Stack>
	);
}
