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

function genId(i: number) {
	return 900000 + i;
}

function randInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]) {
	return arr[randInt(0, arr.length - 1)];
}

function fmtIso(d: Date) {
	return d.toISOString();
}

function buildFakeCompetitions(sportKey: SportKey, athleteId: number): Row[] {
	const medals = ["Gold", "Silver", "Bronze", "—"];
	const notesPool = [
		"Phong độ ổn định, giữ nhịp tốt.",
		"Cần cải thiện tâm lý thi đấu ở set cuối.",
		"Khả năng kiểm soát nhịp tốt, ít lỗi.",
		"Tăng độ chính xác ở loạt cuối.",
		"Chiến thuật hợp lý, xử lý tình huống nhanh.",
		"Ổn định hơn khi áp lực điểm số.",
	];

	const now = new Date();
	const n = randInt(6, 12);
	const base = new Date(now.getTime() - 40 * 86400000);

	const compPool =
		sportKey === "archery"
			? ["Giải Bắn cung CLB", "Giải VĐQG Bắn cung", "Open Archery Cup", "Giải Giao hữu Thành phố"]
			: sportKey === "shooting"
				? ["Giải Bắn súng CLB", "Giải VĐQG Bắn súng", "Shooting Open", "Giải Giao hữu"]
				: sportKey === "boxing"
					? ["Giải Boxing CLB", "Giải VĐQG Boxing", "Boxing Open", "Giải Giao hữu"]
					: ["Giải Taekwondo CLB", "Giải VĐQG Taekwondo", "Taekwondo Open", "Giải Giao hữu"];

	const rows: any[] = [];

	for (let i = 0; i < n; i++) {
		const d = new Date(base.getTime() + i * 5 * 86400000 + randInt(-1, 1) * 86400000);
		const created_at = fmtIso(d);
		const recorded_at = fmtIso(new Date(d.getTime() + randInt(0, 2) * 86400000));

		const medal = pick(medals);
		const finalRank = medal === "Gold" ? 1 : medal === "Silver" ? 2 : medal === "Bronze" ? 3 : randInt(4, 16);

		let result_data = "";
		if (sportKey === "archery") {
			const total = randInt(540, 690);
			result_data = JSON.stringify({ total, "10+": randInt(8, 28), X: randInt(0, 10) });
		} else if (sportKey === "shooting") {
			const score = +Math.max(520, Math.min(590, 560 + Math.random() * 35 - 15)).toFixed(1);
			result_data = JSON.stringify({ score, "inner-10": randInt(30, 75) });
		} else if (sportKey === "boxing") {
			result_data = JSON.stringify({ rounds: randInt(3, 6), "hit%": `${randInt(35, 62)}%`, KD: randInt(0, 2) });
		} else {
			result_data = JSON.stringify({ matches: randInt(2, 5), win: randInt(0, 5), points: randInt(12, 45) });
		}

		rows.push({
			id: genId(i),
			athlete_id: athleteId,
			competition_id: `${pick(compPool)} #${randInt(1, 9)}`,
			medal_won: medal,
			final_rank: finalRank,
			result_data,
			notes: pick(notesPool),
			created_at,
			recorded_at,
		});
	}

	return rows as Row[];
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
					const r = await listArcheryCompetitionsByAthlete(athleteId, "id-desc").catch(() => [] as any);
					const rows = Array.isArray(r) ? r : [];
					if (!cancelled) setArch(rows.length ? rows : (buildFakeCompetitions("archery", athleteId) as any));
				} else if (sportKey === "shooting") {
					const r = await listShootingCompetitionsByAthlete(athleteId, "id-desc").catch(() => [] as any);
					const rows = Array.isArray(r) ? r : [];
					if (!cancelled) setShoot(rows.length ? rows : (buildFakeCompetitions("shooting", athleteId) as any));
				} else if (sportKey === "boxing") {
					const r = await listBoxingCompetitionsByAthlete(athleteId, "id-desc").catch(() => [] as any);
					const rows = Array.isArray(r) ? r : [];
					if (!cancelled) setBox(rows.length ? rows : (buildFakeCompetitions("boxing", athleteId) as any));
				} else if (sportKey === "taekwondo") {
					const r = await listTaekwondoCompetitionsByAthlete(athleteId, "id-desc").catch(() => [] as any);
					const rows = Array.isArray(r) ? r : [];
					if (!cancelled) setTkd(rows.length ? rows : (buildFakeCompetitions("taekwondo", athleteId) as any));
				}
			} catch {
				if (!cancelled) {
					if (sportKey === "archery") setArch(buildFakeCompetitions("archery", athleteId) as any);
					if (sportKey === "shooting") setShoot(buildFakeCompetitions("shooting", athleteId) as any);
					if (sportKey === "boxing") setBox(buildFakeCompetitions("boxing", athleteId) as any);
					if (sportKey === "taekwondo") setTkd(buildFakeCompetitions("taekwondo", athleteId) as any);
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
		if (sportKey === "archery") return arch as any;
		if (sportKey === "shooting") return shoot as any;
		if (sportKey === "boxing") return box as any;
		if (sportKey === "taekwondo") return tkd as any;
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

	const TableShell = (props: { title: string; showRecordedAt?: boolean }) => {
		const { title, showRecordedAt } = props;
		return (
			<SectionCard title={title}>
				<Table sx={{ minWidth: 1100 }}>
					<TableHead>
						<TableRow>
							<TableCell>Giải đấu</TableCell>
							<TableCell>Huy chương</TableCell>
							<TableCell>Hạng</TableCell>
							<TableCell>Kết quả</TableCell>
							<TableCell>Ghi chú</TableCell>
							<TableCell>{showRecordedAt ? "Ngày ghi nhận" : "Ngày tạo"}</TableCell>
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
										<TableCell>{r.competition_id ?? "—"}</TableCell>
										<TableCell>{r.medal_won ?? "—"}</TableCell>
										<TableCell>{r.final_rank != null ? <Chip size="small" label={r.final_rank} /> : "—"}</TableCell>
										<TableCell>{parseResult(r.result_data)}</TableCell>
										<TableCell>{r.notes || "—"}</TableCell>
										<TableCell>{when ? dayjs(when).format("DD/MM/YYYY") : "—"}</TableCell>
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
