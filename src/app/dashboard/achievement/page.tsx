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
import { getLoggedInUserId, getUserById } from "@/services/user.service";
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

function getWhen(r: any): string {
	return (r?.recorded_at as string) || (r?.created_at as string) || "";
}

export default function Page() {
	const router = useRouter();

	const [sort, setSort] = React.useState<"newest" | "oldest">("newest");
	const [search, setSearch] = React.useState<string>("");
	const searchDeferred = React.useDeferredValue(search);
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
		(async () => {
			const uid = getLoggedInUserId();
			if (!uid) return;

			const user = await getUserById(uid).catch(() => null);
			if (!user || cancelled) return;

			setAthleteId(user.id);

			const s = String(user.sport || "")
				.toLowerCase()
				.trim();
			if (s === "shooting" || s.includes("bắn súng")) setSportKey("shooting");
			else if (s === "archery" || s.includes("bắn cung")) setSportKey("archery");
			else if (s === "taekwondo") setSportKey("taekwondo");
			else if (s === "boxing") setSportKey("boxing");
			else setSportKey("");
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	React.useEffect(() => {
		let cancelled = false;
		async function load() {
			if (!athleteId || !sportKey) return;
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
	}, [sportKey, searchDeferred, sort, date]);

	const activeData = React.useMemo<Row[]>(() => {
		if (sportKey === "archery") return arch;
		if (sportKey === "shooting") return shoot;
		if (sportKey === "boxing") return box;
		if (sportKey === "taekwondo") return tkd;
		return [];
	}, [sportKey, arch, shoot, box, tkd]);

	const dateObj = React.useMemo(() => (date ? dayjs(date) : null), [date]);

	const filteredSorted = React.useMemo(() => {
		if (!activeData.length) return [] as Row[];

		const byDate = dateObj
			? activeData.filter((r: any) => {
					const when = getWhen(r);
					if (!when) return false;
					return dayjs(when).isSame(dateObj, "day");
				})
			: activeData;

		const bySort = [...byDate].sort((a: any, b: any) => {
			const da = getWhen(a);
			const db = getWhen(b);
			return sort === "newest" ? db.localeCompare(da) : da.localeCompare(db);
		});

		const q = searchDeferred.trim().toLowerCase();
		if (!q) return bySort;

		return bySort.filter((r) => {
			const buf = [
				(r as any).competition_id,
				(r as any).medal_won,
				(r as any).final_rank,
				(r as any).notes,
				(r as any).result_data,
				getWhen(r),
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			return buf.includes(q);
		});
	}, [activeData, dateObj, sort, searchDeferred]);

	const pagedRows = React.useMemo(
		() => filteredSorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[filteredSorted, page, rowsPerPage]
	);

	const handleAdd = () => {
		if (!athleteId || !sportKey) return;
		router.push(`/dashboard/customers/achievements/${sportKey}/add?athlete=${athleteId}`);
	};

	const handleEdit = (id: number | string) => {
		if (!athleteId || !sportKey) return;
		router.push(`/dashboard/customers/achievements/${sportKey}/update/${id}?athlete=${athleteId}`);
	};

	const TableShell = (props: { title: string; showRecordedAt?: boolean }) => {
		const { title, showRecordedAt } = props;
		return (
			<SectionCard
				title={title}
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
							<TableCell>{showRecordedAt ? "Ngày ghi nhận" : "Ngày tạo"}</TableCell>
							<TableCell align="right">Sửa</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={8}>
									<Box p={2} textAlign="center" color="text.secondary">
										Đang tải dữ liệu…
									</Box>
								</TableCell>
							</TableRow>
						) : pagedRows.length ? (
							pagedRows.map((r: any) => {
								const when = showRecordedAt ? r.recorded_at || r.created_at : r.created_at;
								return (
									<TableRow key={r.id} hover>
										<TableCell>{r.id}</TableCell>
										<TableCell>{r.competition_id ?? "—"}</TableCell>
										<TableCell>{r.medal_won ?? "—"}</TableCell>
										<TableCell>{r.final_rank != null ? <Chip size="small" label={r.final_rank} /> : "—"}</TableCell>
										<TableCell>{parseResult(r.result_data)}</TableCell>
										<TableCell>{r.notes || "—"}</TableCell>
										<TableCell>{when ? dayjs(when).format("DD/MM/YYYY") : "—"}</TableCell>
										<TableCell align="right">
											<IconButton size="small" onClick={() => handleEdit(r.id)}>
												<PencilSimple />
											</IconButton>
										</TableCell>
									</TableRow>
								);
							})
						) : (
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
					count={filteredSorted.length}
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
		);
	};

	return (
		<Stack spacing={3}>
			{/* Filters */}
			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={2}
				alignItems={{ xs: "stretch", md: "stretch" }}
				sx={{ width: "100%" }}
			>
				<TextField
					fullWidth
					label="Tìm kiếm"
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

			{/* Tables */}
			{sportKey === "archery" && <TableShell title="Bắn cung — Thành tích thi đấu" showRecordedAt />}
			{sportKey === "shooting" && <TableShell title="Bắn súng — Thành tích thi đấu" />}
			{sportKey === "boxing" && <TableShell title="Boxing — Thành tích thi đấu" />}
			{sportKey === "taekwondo" && <TableShell title="Taekwondo — Thành tích thi đấu" showRecordedAt />}

			{!sportKey && (
				<Box p={2} textAlign="center" color="text.secondary" border="1px dashed" borderRadius={1.5}>
					Không xác định bộ môn của vận động viên.
				</Box>
			)}
		</Stack>
	);
}
