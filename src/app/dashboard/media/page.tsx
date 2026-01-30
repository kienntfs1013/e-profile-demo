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

function rand(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fakeMedia(athleteId: number): MediaDTO[] {
	const types: MediaTypeKey[] = ["image", "video", "social", "weblink", "document"];
	const platforms = ["Facebook", "Instagram", "YouTube", "TikTok", "Website"];
	return Array.from({ length: rand(8, 15) }).map((_, i) => {
		const d = dayjs().subtract(i * rand(1, 4), "day");
		return {
			id: 100000 + i,
			athlete_id: athleteId,
			title: `Bài đăng truyền thông ${i + 1}`,
			media_type: types[rand(0, types.length - 1)],
			platform_name: platforms[rand(0, platforms.length - 1)],
			media_url: "https://example.com",
			thumbnail_url: "",
			posted_date: d.toISOString(),
			created_at: d.toISOString(),
		} as MediaDTO;
	});
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
		(async () => {
			if (!athleteId) return;
			setLoading(true);
			try {
				const data = await listMediaByAthlete(athleteId, "media_id-desc").catch(() => []);
				if (!cancelled) {
					setRows(data && data.length ? data : fakeMedia(athleteId));
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
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
			const buf = [r.title, r.platform_name, r.media_type, r.media_url, getWhen(r)]
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

	return (
		<Stack spacing={3}>
			<Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ width: "100%" }}>
				<TextField fullWidth label="Tìm kiếm" value={search} onChange={(e) => setSearch(e.target.value)} size="small" />
				<TextField
					select
					label="Loại media"
					value={mediaType}
					onChange={(e) => setMediaType(e.target.value as MediaTypeKey)}
					size="small"
					sx={{ width: 220 }}
				>
					<MenuItem value="">Tất cả</MenuItem>
					<MenuItem value="image">Hình ảnh</MenuItem>
					<MenuItem value="video">Video</MenuItem>
					<MenuItem value="social">Mạng xã hội</MenuItem>
					<MenuItem value="weblink">Liên kết</MenuItem>
					<MenuItem value="document">Tài liệu</MenuItem>
					<MenuItem value="other">Khác</MenuItem>
				</TextField>
				<TextField
					type="date"
					label="Ngày đăng"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					size="small"
					sx={{ width: 220 }}
				/>
				<TextField
					select
					label="Sắp xếp"
					value={sort}
					onChange={(e) => setSort(e.target.value as SortKey)}
					size="small"
					sx={{ width: 200 }}
				>
					<MenuItem value="newest">Mới nhất</MenuItem>
					<MenuItem value="oldest">Cũ nhất</MenuItem>
				</TextField>
			</Stack>

			<SectionCard title="Media — Truyền thông cá nhân">
				<Table sx={{ minWidth: 1100 }}>
					<TableHead>
						<TableRow>
							<TableCell width={64}>Ảnh</TableCell>
							<TableCell>Tiêu đề</TableCell>
							<TableCell>Loại</TableCell>
							<TableCell>Nền tảng</TableCell>
							<TableCell>Ngày đăng</TableCell>
							<TableCell>Liên kết</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{pagedRows.map((r) => {
							const when = getWhen(r);
							return (
								<TableRow key={r.id} hover>
									<TableCell>
										<Avatar variant="rounded" sx={{ width: 48, height: 48 }}>
											{(r.media_type || "?")[0]?.toUpperCase()}
										</Avatar>
									</TableCell>
									<TableCell>{r.title}</TableCell>
									<TableCell>
										<Chip size="small" label={r.media_type} />
									</TableCell>
									<TableCell>{r.platform_name}</TableCell>
									<TableCell>{when ? dayjs(when).format("DD/MM/YYYY") : "—"}</TableCell>
									<TableCell>
										<Link href={r.media_url} target="_blank">
											Mở liên kết
										</Link>
									</TableCell>
								</TableRow>
							);
						})}
						{!loading && !pagedRows.length && (
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
		</Stack>
	);
}
