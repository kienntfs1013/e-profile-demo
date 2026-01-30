"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { deleteMediaById, listMediaByAthlete, type MediaDTO } from "@/services/media.service";
import { fetchUserByIdFromList, getLoggedInUserId, getUserById, type UserDTO } from "@/services/user.service";
import Avatar from "@mui/material/Avatar";
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
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";
import dayjs from "dayjs";

import "dayjs/locale/vi";

dayjs.locale("vi");

type SortKey = "newest" | "oldest";
type MediaTypeKey = "" | "image" | "video" | "social" | "weblink" | "document" | "other";
type ExtraUserFields = { id?: number | string; user_id?: number | string };

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
	return Array.from({ length: rand(6, 12) }).map((_, i) => {
		const d = dayjs().subtract(i * rand(1, 3), "day");
		return {
			id: 900000 + i,
			athlete_id: athleteId,
			title: `Nội dung truyền thông ${i + 1}`,
			media_type: types[rand(0, types.length - 1)],
			platform_name: platforms[rand(0, platforms.length - 1)],
			media_url: "https://example.com",
			thumbnail_url: "",
			posted_date: d.toISOString(),
			created_at: d.toISOString(),
		} as MediaDTO;
	});
}

export function PersonalMediaSection({ id }: { id?: number | string }) {
	const router = useRouter();

	const [user, setUser] = React.useState<(UserDTO & ExtraUserFields) | null>(null);

	React.useEffect(() => {
		let off = false;
		(async () => {
			const viewerId = getLoggedInUserId?.();
			const targetId = id != null && !Number.isNaN(Number(id)) ? Number(id) : viewerId || undefined;
			if (!targetId) {
				if (!off) setUser(null);
				return;
			}
			try {
				const u =
					(await getUserById(targetId).catch(() => null)) ?? (await fetchUserByIdFromList(targetId).catch(() => null));
				if (!off) setUser((u as any) ?? null);
			} catch {
				if (!off) setUser(null);
			}
		})();
		return () => {
			off = true;
		};
	}, [id]);

	const [sort, setSort] = React.useState<SortKey>("newest");
	const [search, setSearch] = React.useState<string>("");
	const searchDeferred = React.useDeferredValue(search);
	const [date, setDate] = React.useState<string>("");
	const [mediaType, setMediaType] = React.useState<MediaTypeKey>("");

	const [rows, setRows] = React.useState<MediaDTO[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const [confirm, setConfirm] = React.useState<MediaDTO | null>(null);

	const athleteId = React.useMemo(() => {
		const raw = (user as any)?.id ?? (user as any)?.user_id;
		const n = Number(raw);
		return Number.isFinite(n) ? n : undefined;
	}, [user]);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!athleteId) return;
			setLoading(true);
			try {
				const data = await listMediaByAthlete(athleteId, "id-desc").catch(() => []);
				if (!cancelled) setRows(data && data.length ? data : fakeMedia(athleteId));
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

		return bySort.filter((r) =>
			[r.title, r.platform_name, r.media_type, r.media_url, getWhen(r)]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()
				.includes(q)
		);
	}, [rows, dateObj, mediaType, sort, searchDeferred]);

	const pagedRows = React.useMemo(
		() => filteredSorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[filteredSorted, page, rowsPerPage]
	);

	const handleAdd = () => {
		if (!athleteId) return;
		router.push(`/dashboard/customers/media/add?athlete=${athleteId}`);
	};

	const handleEdit = (id: number | string) => {
		if (!athleteId) return;
		router.push(`/dashboard/customers/media/update/${id}?athlete=${athleteId}`);
	};

	const doDelete = async () => {
		if (!confirm) return;
		try {
			await deleteMediaById(Number(confirm.id));
			setRows((prev) => prev.filter((r) => Number(r.id) !== Number(confirm.id)));
		} finally {
			setConfirm(null);
		}
	};

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

			<SectionCard
				title="Media — Truyền thông cá nhân"
				header={
					<Button onClick={handleAdd} startIcon={<Plus />} size="small" variant="contained">
						Thêm mới
					</Button>
				}
			>
				<Table sx={{ minWidth: 1100 }}>
					<TableHead>
						<TableRow>
							<TableCell width={64}>Ảnh</TableCell>
							<TableCell>Tiêu đề</TableCell>
							<TableCell>Loại</TableCell>
							<TableCell>Nền tảng</TableCell>
							<TableCell>Ngày đăng</TableCell>
							<TableCell>Liên kết</TableCell>
							<TableCell align="right">Thao tác</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{pagedRows.map((r) => (
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
								<TableCell>{dayjs(getWhen(r)).format("DD/MM/YYYY")}</TableCell>
								<TableCell>
									<Link href={r.media_url} target="_blank">
										Mở liên kết
									</Link>
								</TableCell>
								<TableCell align="right">
									<IconButton size="small" onClick={() => handleEdit(r.id)}>
										<PencilSimple />
									</IconButton>
									<IconButton size="small" color="error" onClick={() => setConfirm(r)}>
										<Trash />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
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

			<Dialog open={!!confirm} onClose={() => setConfirm(null)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận xóa media</DialogTitle>
				<DialogContent>
					<DialogContentText>Bạn có chắc muốn xóa bản ghi {confirm?.id ?? ""}?</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" onClick={() => setConfirm(null)}>
						Hủy
					</Button>
					<Button color="error" variant="contained" onClick={doDelete}>
						Đồng ý
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}
