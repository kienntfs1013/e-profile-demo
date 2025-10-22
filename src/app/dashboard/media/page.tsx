"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { listMediaByAthlete, type MediaDTO } from "@/services/media.service";
import { getLoggedInUserId, getUserById } from "@/services/user.service";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
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

type SortKey = "newest" | "oldest";
type MediaTypeKey = "" | "image" | "video" | "social" | "weblink" | "document" | "other";

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

function getWhen(r: MediaDTO): string {
	return (r.posted_date as string) || (r.created_at as string) || "";
}

export default function Page() {
	const router = useRouter();

	const [sort, setSort] = React.useState<SortKey>("newest");
	const [search, setSearch] = React.useState<string>("");
	const searchDeferred = React.useDeferredValue(search);
	const [date, setDate] = React.useState<string>("");
	const [mediaType, setMediaType] = React.useState<MediaTypeKey>("");

	const [rows, setRows] = React.useState<MediaDTO[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const [athleteId, setAthleteId] = React.useState<number | undefined>(undefined);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			const uid = getLoggedInUserId();
			if (!uid) return;
			const user = await getUserById(uid).catch(() => null);
			if (!user || cancelled) return;
			setAthleteId(user.id);
		})();
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
				const data = await listMediaByAthlete(athleteId, "media_id-desc");
				if (!cancelled) setRows(data || []);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [athleteId]);

	React.useEffect(() => {
		setPage(0);
	}, [searchDeferred, sort, date, mediaType]);

	const dateObj = React.useMemo(() => (date ? dayjs(date) : null), [date]);

	const filteredSorted = React.useMemo(() => {
		if (!rows.length) return [] as MediaDTO[];

		const byDate = dateObj
			? rows.filter((r) => {
					const when = getWhen(r);
					if (!when) return false;
					return dayjs(when).isSame(dateObj, "day");
				})
			: rows;

		const byType = mediaType ? byDate.filter((r) => r.media_type === mediaType) : byDate;

		const bySort = [...byType].sort((a, b) => {
			const da = getWhen(a);
			const db = getWhen(b);
			return sort === "newest" ? db.localeCompare(da) : da.localeCompare(db);
		});

		const q = searchDeferred.trim().toLowerCase();
		if (!q) return bySort;

		return bySort.filter((r) => {
			const buf = [r.title, r.platform_name, r.media_type, r.media_url, r.thumbnail_url, getWhen(r)]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return buf.includes(q);
		});
	}, [rows, dateObj, mediaType, sort, searchDeferred]);

	const pagedRows = React.useMemo(
		() => filteredSorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[filteredSorted, page, rowsPerPage]
	);

	const TableShell = () => {
		return (
			<SectionCard title="Media — Truyền thông cá nhân">
				<Table sx={{ minWidth: 1100 }}>
					<TableHead>
						<TableRow>
							<TableCell style={{ width: 64 }}>Ảnh</TableCell>
							<TableCell>Tiêu đề</TableCell>
							<TableCell>Loại</TableCell>
							<TableCell>Nền tảng</TableCell>
							<TableCell>Ngày đăng</TableCell>
							<TableCell>Liên kết</TableCell>
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
							pagedRows.map((r) => {
								const when = getWhen(r);
								return (
									<TableRow key={r.id} hover>
										<TableCell>
											{r.thumbnail_url ? (
												<Avatar
													variant="rounded"
													src={r.thumbnail_url}
													alt={r.title || ""}
													sx={{ width: 48, height: 48 }}
												/>
											) : (
												<Avatar variant="rounded" sx={{ width: 48, height: 48 }}>
													{(r.media_type || "?").slice(0, 1).toUpperCase()}
												</Avatar>
											)}
										</TableCell>
										<TableCell>{r.title || "—"}</TableCell>
										<TableCell>
											<Chip size="small" label={r.media_type} />
										</TableCell>
										<TableCell>{r.platform_name || "—"}</TableCell>
										<TableCell>{when ? dayjs(when).format("DD/MM/YYYY") : "—"}</TableCell>
										<TableCell>
											{r.media_url ? (
												<Link href={r.media_url} target="_blank" rel="noopener noreferrer">
													Mở liên kết
												</Link>
											) : (
												"—"
											)}
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

				<TextField
					select
					label="Loại media"
					value={mediaType}
					onChange={(e) => setMediaType(e.target.value as MediaTypeKey)}
					size="small"
					sx={{ width: { xs: "100%", md: 220 } }}
				>
					<MenuItem value="">Tất cả</MenuItem>
					<MenuItem value="image">Hình ảnh</MenuItem>
					<MenuItem value="video">Video</MenuItem>
					<MenuItem value="social">Mạng xã hội</MenuItem>
					<MenuItem value="weblink">Liên kết</MenuItem>
					<MenuItem value="document">Tài liệu</MenuItem>
					<MenuItem value="other">Khác</MenuItem>
				</TextField>

				<Stack direction="row" spacing={1.5} sx={{ width: { xs: "100%", md: "auto" } }}>
					<TextField
						type="date"
						label="Ngày đăng"
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
					onChange={(e) => setSort(e.target.value as SortKey)}
					size="small"
					sx={{ width: { xs: "100%", md: 200 } }}
				>
					<MenuItem value="newest">Mới nhất</MenuItem>
					<MenuItem value="oldest">Cũ nhất</MenuItem>
				</TextField>
			</Stack>

			<TableShell />

			{!athleteId && (
				<Box p={2} textAlign="center" color="text.secondary" border="1px dashed" borderRadius={1.5}>
					Không xác định vận động viên đang đăng nhập.
				</Box>
			)}
		</Stack>
	);
}
