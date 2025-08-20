"use client";

import * as React from "react";
import {
	Box,
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	Divider,
	MenuItem,
	Link as MLink,
	Pagination,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";

type NewsItem = {
	id: string;
	title: string;
	summary?: string;
	image: string;
	href: string;
	source?: string;
	tag?: string;
	date?: string;
};

type DocItem = {
	id: string;
	code: string;
	date: string;
	excerpt: string;
	fileUrl?: string;
	sport?: string;
};

const featuredSeed: NewsItem = {
	id: "f1",
	title: "Chiến lược nâng cao hiệu quả điều hành các đội tuyển: tối ưu lịch tập, dinh dưỡng và phục hồi",
	summary:
		"Tổng cục TDTT phối hợp Liên đoàn triển khai điều hành thống nhất cho 4 bộ môn trọng điểm: Taekwondo, Bắn súng, Bắn cung và Thể lực đội tuyển.",
	image: "https://tdtt.gov.vn/Portals/0/images/article/433459506_122136075362118630_4820652120445226955_n.jpg",
	href: "#",
	source: "Chinhphu.vn",
	tag: "Điều hành",
	date: "2025-08-19",
};

const subNewsSeed: NewsItem[] = [
	{
		id: "s1",
		title: "Quy định mới về quản lý tải vận động cho đội Taekwondo",
		image: "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2023/3/23/1171114/IMG_3412.JPG",
		href: "#",
		tag: "Taekwondo",
		date: "2025-08-18",
	},
	{
		id: "s2",
		title: "Chuẩn hoá quy trình kiểm tra nội bộ súng hơi 10m",
		image:
			"https://tdtt.gov.vn/DesktopModules/DnnForge%20-%20NewsArticles/ImageHandler.ashx?Width=600&Height=400&HomeDirectory=%2FPortals%2F0%2F&FileName=images%2Farticle%2Fz6405178162078_29f7e3a487dd3957c4ec6b65da36ea4e.jpg&PortalID=0&q=1&s=1",
		href: "#",
		tag: "Bắn súng",
		date: "2025-08-18",
	},
	{
		id: "s3",
		title: "Chu kỳ test thể lực và phục hồi cho cung thủ",
		image: "https://image.sggp.org.vn/w1000/Uploaded/2025/mrwqlqrnw/2024_01_08/ban-cung-1-1826.jpg.webp",
		href: "#",
		tag: "Bắn cung",
		date: "2025-08-17",
	},
];

const directiveMainSeed: NewsItem = {
	id: "d-main",
	title: "Nghiên cứu giải pháp tối ưu hoá micro-cycle để giữ phong độ đỉnh cao trước giải quốc tế",
	image: "https://hnm.1cdn.vn/2024/12/10/10-boxing-vn.jpg",
	href: "#",
	tag: "Boxing",
	date: "2025-08-17",
};

const directiveSideSeed: NewsItem[] = [
	{
		id: "d1",
		title: "Quy định mới về phê duyệt thiết bị tập bắn súng điện tử cho tuyến trẻ",
		image:
			"https://cdn.nhandan.vn/images/1ef398c4e2fb4bf07980a2ded785b3ef33c78c497b14e4deefcc45b2f5b6faaf9ebad080d5338620c02ab31a99aaa16b964c6eaab2096c9bc82dd390454c6f1d/tuyen-2-copy-6711.jpg",
		href: "#",
		tag: "Bắn súng",
		date: "2025-08-16",
	},
	{
		id: "d2",
		title: "Phê duyệt khung dữ liệu kiểm soát tải tập của Taekwondo theo KPI tuần",
		image:
			"https://static2-images.vnncdn.net/vps_images_publish/000001/000004/2025/6/23/2-giai-dau-taekwondo-kich-tinh-trong-tuan-le-the-thao-cua-cj-k-festa-2025-1662.png",
		href: "#",
		tag: "Taekwondo",
		date: "2025-08-16",
	},
	{
		id: "d3",
		title: "Một số quy định mới về tiêu chuẩn cung – dây – mũi tên cho đội tuyển",
		image:
			"https://nguoiduatin.mediacdn.vn/media/nguyen-huu-thang/2022/05/05/doi-tuyen-ban-cung-viet-nam-nguoiduatinvn-15.jpg",
		href: "#",
		tag: "Bắn cung",
		date: "2025-08-16",
	},
];

const docsAll: DocItem[] = [
	{
		id: "doc1",
		code: "7719/VPCP-CN",
		date: "2025-08-19",
		excerpt: "V/v triển khai Đề án nâng chuẩn điều hành tập luyện đội tuyển Boxing giai đoạn 1",
		fileUrl: "#",
		sport: "Boxing",
	},
	{
		id: "doc2",
		code: "1757/QĐ-TTg",
		date: "2025-08-18",
		excerpt: "Phê duyệt phương án cắt giảm TTHC liên quan đến đào tạo VĐV Taekwondo",
		fileUrl: "#",
		sport: "Taekwondo",
	},
	{
		id: "doc3",
		code: "980/TTg-CN",
		date: "2025-08-18",
		excerpt: "Thẩm định mua sắm hệ thống bia điện tử 10m cho Trung tâm Bắn súng",
		fileUrl: "#",
		sport: "Bắn súng",
	},
	{
		id: "doc4",
		code: "1777/QĐ-TTg",
		date: "2025-08-18",
		excerpt: "Thành lập Ban Điều hành dữ liệu tải tập – phục hồi đội Bắn cung",
		fileUrl: "#",
		sport: "Bắn cung",
	},
	{
		id: "doc5",
		code: "22/CT-TTg",
		date: "2025-08-18",
		excerpt: "Tăng cường giải pháp an toàn khi tập nặng chu kỳ trước thi đấu",
		fileUrl: "#",
		sport: "Chung",
	},
	{
		id: "doc6",
		code: "227/2025/NĐ-CP",
		date: "2025-08-16",
		excerpt: "Sửa đổi tiêu chuẩn thiết bị phục hồi cho đội tuyển",
		fileUrl: "#",
		sport: "Chung",
	},
	{
		id: "doc7",
		code: "7642/VPCP-CN",
		date: "2025-08-16",
		excerpt: "Quy định chi tiết về kiểm soát đối tác công tư trong vận hành đội tuyển",
		fileUrl: "#",
		sport: "Chung",
	},
	{
		id: "doc8",
		code: "315/BTC-SPORT",
		date: "2025-08-15",
		excerpt: "Định mức dinh dưỡng cho Boxing theo hạng cân",
		fileUrl: "#",
		sport: "Boxing",
	},
	{
		id: "doc9",
		code: "121/GDTT-ARCH",
		date: "2025-08-14",
		excerpt: "Khung kiểm tra định kỳ sức mạnh kéo – đẩy cho Bắn cung",
		fileUrl: "#",
		sport: "Bắn cung",
	},
	{
		id: "doc10",
		code: "88/GDTT-SHOOT",
		date: "2025-08-13",
		excerpt: "Quy trình an toàn trường bắn và hiệu chuẩn thiết bị",
		fileUrl: "#",
		sport: "Bắn súng",
	},
];

const SPORT_OPTIONS = ["Tất cả", "Taekwondo", "Bắn súng", "Bắn cung", "Boxing"] as const;
type SportFilter = (typeof SPORT_OPTIONS)[number];

export default function ExecutivePage() {
	const [keyword, setKeyword] = React.useState("");
	const [from, setFrom] = React.useState("");
	const [to, setTo] = React.useState("");
	const [sort, setSort] = React.useState<"desc" | "asc">("desc");
	const [sport, setSport] = React.useState<SportFilter>("Tất cả");

	const pageSize = 6;
	const [pageDocs, setPageDocs] = React.useState(1);

	const inRange = (d?: string) => {
		if (!d) return true;
		const t = new Date(d).getTime();
		if (from) {
			const f = new Date(from);
			f.setHours(0, 0, 0, 0);
			if (t < f.getTime()) return false;
		}
		if (to) {
			const e = new Date(to);
			e.setHours(23, 59, 59, 999);
			if (t > e.getTime()) return false;
		}
		return true;
	};

	const allNews = React.useMemo(() => [featuredSeed, ...subNewsSeed, directiveMainSeed, ...directiveSideSeed], []);

	const newsFiltered = React.useMemo(() => {
		const byKW = (n: NewsItem) =>
			keyword
				? (n.title + " " + (n.summary || "") + " " + (n.tag || "")).toLowerCase().includes(keyword.toLowerCase())
				: true;
		const bySport = (n: NewsItem) => (sport === "Tất cả" ? true : (n.tag || "").toLowerCase() === sport.toLowerCase());
		const arr = allNews.filter((n) => byKW(n) && bySport(n) && inRange(n.date));
		arr.sort((a, b) => {
			const ta = new Date(a.date || 0).getTime();
			const tb = new Date(b.date || 0).getTime();
			return sort === "desc" ? tb - ta : ta - tb;
		});
		return arr;
	}, [allNews, keyword, sport, from, to, sort]);

	const featured = newsFiltered[0] ?? featuredSeed;
	const subNews = newsFiltered.slice(1, 4).length ? newsFiltered.slice(1, 4) : subNewsSeed;
	const directiveMain = newsFiltered[4] ?? directiveMainSeed;
	const directiveSide = newsFiltered.slice(5, 8).length ? newsFiltered.slice(5, 8) : directiveSideSeed;

	const docsFiltered = React.useMemo(() => {
		const byKW = (d: DocItem) =>
			keyword ? (d.code + " " + d.excerpt + " " + (d.sport || "")).toLowerCase().includes(keyword.toLowerCase()) : true;
		const bySport = (d: DocItem) =>
			sport === "Tất cả" ? true : (d.sport || "Chung").toLowerCase() === sport.toLowerCase();
		return docsAll
			.filter((d) => byKW(d) && bySport(d) && inRange(d.date))
			.sort((a, b) =>
				sort === "desc"
					? new Date(b.date).getTime() - new Date(a.date).getTime()
					: new Date(a.date).getTime() - new Date(b.date).getTime()
			);
	}, [keyword, sport, from, to, sort]);

	const pagedDocs = React.useMemo(() => {
		const start = (pageDocs - 1) * pageSize;
		return docsFiltered.slice(start, start + pageSize);
	}, [docsFiltered, pageDocs]);

	return (
		<Box sx={{ p: { xs: 2, md: 3 } }}>
			<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
				<Box sx={{ width: 6, height: 26, bgcolor: "primary.main", borderRadius: 1 }} />
				<Typography variant="h6" fontWeight={900} letterSpacing={0.5}>
					TIN THỂ THAO – ĐIỀU HÀNH
				</Typography>
			</Stack>

			<Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
				<TextField
					fullWidth
					size="small"
					label="Tìm kiếm"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					sx={{ flex: 1, minWidth: 220 }}
				/>
				<TextField
					fullWidth
					size="small"
					type="date"
					label="Từ ngày"
					InputLabelProps={{ shrink: true }}
					value={from}
					onChange={(e) => setFrom(e.target.value)}
					sx={{ flex: 1, minWidth: 160 }}
				/>
				<TextField
					fullWidth
					size="small"
					type="date"
					label="Đến ngày"
					InputLabelProps={{ shrink: true }}
					value={to}
					onChange={(e) => setTo(e.target.value)}
					sx={{ flex: 1, minWidth: 160 }}
				/>
				<TextField
					fullWidth
					size="small"
					select
					label="Môn"
					value={sport}
					onChange={(e) => setSport(e.target.value as SportFilter)}
					sx={{ flex: 1, minWidth: 160 }}
				>
					{SPORT_OPTIONS.map((opt) => (
						<MenuItem key={opt} value={opt}>
							{opt}
						</MenuItem>
					))}
				</TextField>
				<TextField
					fullWidth
					size="small"
					select
					label="Sắp xếp"
					value={sort}
					onChange={(e) => setSort(e.target.value as "desc" | "asc")}
					sx={{ flex: 1, minWidth: 140 }}
				>
					<MenuItem value="desc">Mới nhất</MenuItem>
					<MenuItem value="asc">Cũ nhất</MenuItem>
				</TextField>
			</Stack>

			{/* Featured */}
			<Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="stretch">
				<Card sx={{ flex: 7, borderRadius: 2, overflow: "hidden" }}>
					<CardActionArea component="a" href={featured.href}>
						<CardMedia
							component="img"
							image={featured.image}
							alt={featured.title}
							sx={{ height: { xs: 220, md: 380 }, objectFit: "cover" }}
						/>
					</CardActionArea>
				</Card>
				<Stack flex={5} justifyContent="center" spacing={1.5}>
					<Typography variant="h4" fontWeight={800} lineHeight={1.2}>
						<MLink href={featured.href} underline="none" color="inherit">
							{featured.title}
						</MLink>
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{featured.source ? `(${featured.source}) — ` : ""}
						{featured.summary}
					</Typography>
				</Stack>
			</Stack>

			{/* Sub news */}
			<Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mt: 3 }}>
				{subNews.map((n) => (
					<Card key={n.id} sx={{ flex: 1, borderRadius: 2, overflow: "hidden" }}>
						<CardActionArea component="a" href={n.href}>
							<CardMedia component="img" image={n.image} alt={n.title} sx={{ height: 200, objectFit: "cover" }} />
							<CardContent>
								<Typography variant="h6" fontWeight={800} lineHeight={1.3}>
									{n.title}
								</Typography>
							</CardContent>
						</CardActionArea>
					</Card>
				))}
			</Stack>

			{/* Directive block */}
			<Box sx={{ mt: 4 }}>
				<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
					<Box sx={{ width: 6, height: 26, bgcolor: "primary.main", borderRadius: 1 }} />
					<Typography variant="h6" fontWeight={900} letterSpacing={0.5}>
						TIN CHỈ ĐẠO, ĐIỀU HÀNH
					</Typography>
				</Stack>

				<Stack direction={{ xs: "column", md: "row" }} spacing={3}>
					<Card sx={{ flex: 7, borderRadius: 2, overflow: "hidden" }}>
						<CardActionArea component="a" href={directiveMain.href}>
							<CardMedia
								component="img"
								image={directiveMain.image}
								alt={directiveMain.title}
								sx={{ height: { xs: 220, md: 360 }, objectFit: "cover" }}
							/>
							<CardContent>
								<Typography variant="h5" fontWeight={800} lineHeight={1.25}>
									{directiveMain.title}
								</Typography>
							</CardContent>
						</CardActionArea>
					</Card>

					<Stack flex={5} spacing={2} divider={<Divider flexItem />}>
						{directiveSide.map((n) => (
							<Stack key={n.id} direction="row" spacing={2} alignItems="center">
								<Card sx={{ width: 120, height: 80, borderRadius: 1.5, overflow: "hidden", flexShrink: 0 }}>
									<CardActionArea component="a" href={n.href}>
										<CardMedia
											component="img"
											image={n.image}
											alt={n.title}
											sx={{ width: "100%", height: "100%", objectFit: "cover" }}
										/>
									</CardActionArea>
								</Card>
								<Box sx={{ minWidth: 0 }}>
									<Typography variant="subtitle1" fontWeight={800} lineHeight={1.25}>
										<MLink href={n.href} underline="none" color="inherit">
											{n.title}
										</MLink>
									</Typography>
									{n.tag && (
										<Typography variant="caption" color="text.secondary">
											{n.tag}
										</Typography>
									)}
								</Box>
							</Stack>
						))}
					</Stack>
				</Stack>
			</Box>

			{/* Docs table */}
			<Box sx={{ mt: 5 }}>
				<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
					<Stack direction="row" alignItems="center" spacing={1}>
						<Box sx={{ width: 6, height: 26, bgcolor: "primary.main", borderRadius: 1 }} />
						<Typography variant="h6" fontWeight={900} letterSpacing={0.5}>
							VĂN BẢN CHỈ ĐẠO, ĐIỀU HÀNH
						</Typography>
					</Stack>
				</Stack>

				<Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
					<Table size="medium" sx={{ minWidth: 960 }}>
						<TableHead sx={{ bgcolor: "grey.50" }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 700 }}>Số ký hiệu</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Ngày ban hành</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Trích yếu</TableCell>
								<TableCell sx={{ fontWeight: 700, width: 160 }}>Tài liệu đính kèm</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{pagedDocs.map((d) => (
								<TableRow key={d.id} hover>
									<TableCell>
										<MLink href="#" underline="hover">
											{d.code}
										</MLink>
									</TableCell>
									<TableCell>{new Date(d.date).toLocaleDateString("vi-VN")}</TableCell>
									<TableCell>{d.excerpt}</TableCell>
									<TableCell>
										{d.fileUrl ? (
											<MLink href={d.fileUrl} underline="hover">
												Tải về
											</MLink>
										) : (
											"-"
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					<Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
						<Pagination
							count={Math.ceil(docsFiltered.length / pageSize)}
							page={pageDocs}
							onChange={(_, v) => setPageDocs(v)}
							color="primary"
							shape="rounded"
							size="small"
						/>
					</Stack>
				</Box>
			</Box>
		</Box>
	);
}
