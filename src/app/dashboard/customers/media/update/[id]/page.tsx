// C:\DREAMAX\e-profile\material-kit-react\src\app\dashboard\customers\media\update\[id]\page.tsx
"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getMediaById, updateMediaById, type MediaDTO } from "@/services/media.service";
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";

type Mode = "add" | "update";

function MediaForm({
	mode,
	athleteId,
	initial,
	title,
	id,
}: {
	mode: Mode;
	athleteId?: number;
	initial?: Partial<MediaDTO>;
	title: string;
	id: number;
}) {
	const router = useRouter();
	const [values, setValues] = React.useState<Partial<MediaDTO>>({
		media_type: initial?.media_type ?? "image",
		title: initial?.title ?? "",
		media_url: initial?.media_url ?? "",
		thumbnail_url: initial?.thumbnail_url ?? "",
		platform_name: initial?.platform_name ?? "",
		posted_date: initial?.posted_date ? dayjs(initial.posted_date).format("YYYY-MM-DD") : "",
	});

	const [submitting, setSubmitting] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const handleChange = (key: keyof MediaDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setValues((v) => ({ ...v, [key]: e.target.value }));
	};

	const goBack = () => {
		if (athleteId) router.push(`/dashboard/customers/${athleteId}`);
		else router.back();
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		if (!values.media_type || !values.media_url) {
			setError("Vui lòng nhập đủ Loại media và Liên kết");
			return;
		}
		setSubmitting(true);
		try {
			await updateMediaById(id, {
				media_type: values.media_type!,
				title: values.title?.trim() || undefined,
				media_url: values.media_url!.trim(),
				thumbnail_url: values.thumbnail_url?.trim() || undefined,
				platform_name: values.platform_name?.trim() || undefined,
				posted_date: values.posted_date ? dayjs(values.posted_date).toISOString() : undefined,
			});
			goBack();
		} catch (err: any) {
			setError(err?.message || "Không thể cập nhật media");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Box component="form" onSubmit={onSubmit} sx={{ width: "100%" }}>
			<Paper
				elevation={0}
				sx={{
					p: { xs: 2, md: 3 },
					borderRadius: 2,
					border: "1px solid",
					borderColor: "divider",
					maxWidth: 720,
					mx: "auto",
				}}
			>
				<Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
					{title}
				</Typography>

				<Stack spacing={2}>
					<TextField
						select
						label="Loại media"
						value={values.media_type ?? ""}
						onChange={handleChange("media_type")}
						required
					>
						<MenuItem value="image">Hình ảnh</MenuItem>
						<MenuItem value="video">Video</MenuItem>
						<MenuItem value="social">Mạng xã hội</MenuItem>
						<MenuItem value="weblink">Liên kết</MenuItem>
						<MenuItem value="document">Tài liệu</MenuItem>
						<MenuItem value="other">Khác</MenuItem>
					</TextField>

					<TextField label="Tiêu đề" value={values.title ?? ""} onChange={handleChange("title")} />

					<TextField
						label="Liên kết media"
						value={values.media_url ?? ""}
						onChange={handleChange("media_url")}
						required
					/>

					<TextField label="Nền tảng" value={values.platform_name ?? ""} onChange={handleChange("platform_name")} />

					<TextField
						type="date"
						label="Ngày đăng"
						value={values.posted_date ? dayjs(values.posted_date).format("YYYY-MM-DD") : ""}
						onChange={(e) => setValues((v) => ({ ...v, posted_date: e.target.value }))}
						InputLabelProps={{ shrink: true }}
					/>

					{error && <Box sx={{ color: "error.main", mt: 1 }}>{error}</Box>}

					<Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
						<Button type="submit" variant="contained" disabled={submitting}>
							Lưu
						</Button>
						<Button variant="outlined" onClick={goBack} disabled={submitting}>
							Hủy
						</Button>
					</Stack>
				</Stack>
			</Paper>
		</Box>
	);
}

export default function Page() {
	const { id: idParam } = useParams<{ id: string }>();
	const search = useSearchParams();

	const id = Number(idParam ?? "");
	if (Number.isNaN(id)) throw new Error("ID không hợp lệ");

	const athleteId = Number(search.get("athlete") ?? "");
	const [initial, setInitial] = React.useState<MediaDTO | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoading(true);
				const data = await getMediaById(id);
				if (mounted) setInitial(data);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [id]);

	if (loading) {
		return <Box sx={{ p: 3, color: "text.secondary" }}>Đang tải…</Box>;
	}

	if (!initial) {
		return <Box sx={{ p: 3 }}>Không tìm thấy media</Box>;
	}

	return (
		<MediaForm
			mode="update"
			athleteId={Number.isFinite(athleteId) ? athleteId : undefined}
			id={id}
			initial={initial}
			title="Cập nhật media"
		/>
	);
}
