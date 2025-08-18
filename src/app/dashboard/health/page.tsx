"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Drop } from "@phosphor-icons/react/dist/ssr/Drop";
import { Footprints } from "@phosphor-icons/react/dist/ssr/Footprints";
import { Gauge } from "@phosphor-icons/react/dist/ssr/Gauge";
import { Heartbeat } from "@phosphor-icons/react/dist/ssr/Heartbeat";
import { Moon } from "@phosphor-icons/react/dist/ssr/Moon";
import { Pulse } from "@phosphor-icons/react/dist/ssr/Pulse";
import { Scales } from "@phosphor-icons/react/dist/ssr/Scales";
import { Syringe } from "@phosphor-icons/react/dist/ssr/Syringe";
import { TestTube } from "@phosphor-icons/react/dist/ssr/TestTube";
import { Thermometer } from "@phosphor-icons/react/dist/ssr/Thermometer";
import { Waveform } from "@phosphor-icons/react/dist/ssr/Waveform";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

type Metric = {
	key: string;
	label: string;
	value: string;
	unit?: string;
	helper?: string;
	icon: React.ElementType;
	color: string;
	group: "vitals" | "activity" | "labs" | "all";
};

type HealthStatus = "good" | "normal" | "danger";
type HealthEval = { status: HealthStatus; label: string; chipColor: "success" | "warning" | "error" };

const ALL_METRICS: Metric[] = [
	{ key: "spo2", label: "Oxy trong máu", value: "98", unit: "%", icon: Drop, color: "#22c55e", group: "vitals" },
	{ key: "bpm", label: "Nhịp tim", value: "72", unit: "BPM", icon: Heartbeat, color: "#ef4444", group: "vitals" },
	{ key: "bp", label: "Huyết áp", value: "118/76", unit: "mmHg", icon: Gauge, color: "#f97316", group: "vitals" },
	{ key: "temp", label: "Nhiệt độ", value: "36.6", unit: "°C", icon: Thermometer, color: "#3b82f6", group: "vitals" },
	{ key: "glucose", label: "Đường huyết", value: "92", unit: "mg/dL", icon: Syringe, color: "#ef4444", group: "labs" },
	{ key: "weight", label: "Cân nặng", value: "154.3", unit: "lb", icon: Scales, color: "#22c55e", group: "vitals" },
	{ key: "sleep", label: "Giấc ngủ", value: "7h 45m", icon: Moon, color: "#8b5cf6", group: "activity" },
	{
		key: "steps",
		label: "Bước đi",
		value: "3,580",
		helper: "35% mục tiêu",
		icon: Footprints,
		color: "#6366f1",
		group: "activity",
	},
	{ key: "hrv", label: "HRV", value: "42", unit: "ms", icon: Pulse, color: "#06b6d4", group: "vitals" },
	{ key: "ecg", label: "ECG", value: "Bình thường", icon: Waveform, color: "#f59e0b", group: "vitals" },
	{ key: "uric", label: "Uric Acid", value: "5.6", unit: "mg/dL", icon: TestTube, color: "#fb7185", group: "labs" },
];

/* -------- Helpers: parse + đánh giá tình trạng -------- */
const toNumber = (s: string) => Number(String(s).replace(/[^\d.-]/g, ""));
const parseBP = (s: string) => {
	const [sys, dia] = s.split("/").map((x) => Number(x));
	return { sys, dia };
};
const parseSleepHours = (s: string) => {
	const m = s.match(/(\d+)h\s*(\d+)?m?/i);
	const h = m ? Number(m[1]) : 0;
	const min = m && m[2] ? Number(m[2]) : 0;
	return h + min / 60;
};

function evalMetric(m: Metric): HealthEval {
	switch (m.key) {
		case "spo2": {
			const v = toNumber(m.value);
			if (v >= 97) return { status: "good", label: "Tốt", chipColor: "success" };
			if (v >= 95) return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "bpm": {
			const v = toNumber(m.value);
			if (v >= 60 && v <= 80) return { status: "good", label: "Tốt", chipColor: "success" };
			if ((v >= 50 && v < 60) || (v > 80 && v <= 100))
				return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "bp": {
			const { sys, dia } = parseBP(m.value);
			if (sys < 120 && dia < 80) return { status: "good", label: "Tốt", chipColor: "success" };
			if (sys < 130 && dia < 80) return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "temp": {
			const v = toNumber(m.value);
			if (v >= 36 && v <= 37.2) return { status: "good", label: "Tốt", chipColor: "success" };
			if ((v >= 35.5 && v < 36) || (v > 37.2 && v <= 37.8))
				return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "glucose": {
			const v = toNumber(m.value);
			if (v >= 80 && v <= 99) return { status: "good", label: "Tốt", chipColor: "success" };
			if ((v >= 70 && v < 80) || (v >= 100 && v <= 125))
				return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "sleep": {
			const h = parseSleepHours(m.value);
			if (h >= 7 && h <= 9) return { status: "good", label: "Tốt", chipColor: "success" };
			if ((h >= 6 && h < 7) || (h > 9 && h <= 10))
				return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "steps": {
			const v = toNumber(m.value);
			if (v >= 8000) return { status: "good", label: "Tốt", chipColor: "success" };
			if (v >= 5000) return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "hrv": {
			const v = toNumber(m.value);
			if (v >= 50) return { status: "good", label: "Tốt", chipColor: "success" };
			if (v >= 30) return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "ecg": {
			const ok = m.value.toLowerCase().includes("bình thường");
			return ok
				? { status: "good", label: "Tốt", chipColor: "success" }
				: { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		case "uric": {
			const v = toNumber(m.value);
			if (v >= 3.5 && v <= 7.2) return { status: "good", label: "Tốt", chipColor: "success" };
			if ((v >= 3.0 && v < 3.5) || (v > 7.2 && v <= 8.0))
				return { status: "normal", label: "Bình thường", chipColor: "warning" };
			return { status: "danger", label: "Nguy hiểm", chipColor: "error" };
		}
		// Cân nặng: thiếu chiều cao → coi là bình thường (tham khảo)
		case "weight":
		default:
			return { status: "normal", label: "Bình thường", chipColor: "warning" };
	}
}

/* -------- Thẻ metric hiển thị Chip đánh giá -------- */
function MetricCard({ m }: { m: Metric }) {
	const Icon = m.icon;
	const evalRes = evalMetric(m);

	return (
		<Card sx={{ height: "100%", borderRadius: 2 }}>
			<CardContent>
				<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25, gap: 1 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 600, flex: "1 1 auto", minWidth: 0 }}>
						{m.label}
					</Typography>
					<Chip size="small" label={evalRes.label} color={evalRes.chipColor} sx={{ mr: 1 }} />
					<Box
						sx={{
							width: 32,
							height: 32,
							borderRadius: "999px",
							display: "grid",
							placeItems: "center",
							bgcolor: m.color,
							color: "#fff",
							flex: "0 0 auto",
						}}
					>
						<Icon weight="fill" />
					</Box>
				</Box>

				<Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
					<Typography variant="h5" sx={{ fontWeight: 700 }}>
						{m.value}
					</Typography>
					{m.unit ? (
						<Typography variant="body2" color="text.secondary">
							{m.unit}
						</Typography>
					) : null}
				</Box>

				{m.helper ? (
					<Typography variant="caption" color="text.secondary">
						{m.helper}
					</Typography>
				) : null}
			</CardContent>
		</Card>
	);
}

type DayPoint = { d: string; bpm: number; steps: number; spo2: number; sleepH: number; glucose: number };
const data7d: DayPoint[] = [
	{ d: "T2", bpm: 70, steps: 3200, spo2: 98, sleepH: 7.5, glucose: 92 },
	{ d: "T3", bpm: 74, steps: 4100, spo2: 98, sleepH: 7.2, glucose: 94 },
	{ d: "T4", bpm: 71, steps: 2800, spo2: 97, sleepH: 7.8, glucose: 90 },
	{ d: "T5", bpm: 72, steps: 4000, spo2: 98, sleepH: 6.9, glucose: 93 },
	{ d: "T6", bpm: 73, steps: 5200, spo2: 99, sleepH: 7.0, glucose: 95 },
	{ d: "T7", bpm: 69, steps: 6000, spo2: 98, sleepH: 8.1, glucose: 91 },
	{ d: "CN", bpm: 68, steps: 4500, spo2: 98, sleepH: 8.0, glucose: 92 },
];

const data30d: DayPoint[] = Array.from({ length: 30 }).map((_, i) => ({
	d: `${i + 1}`,
	bpm: 68 + ((i * 7) % 10),
	steps: 2500 + ((i * 523) % 5500),
	spo2: 97 + (i % 3),
	sleepH: 6.5 + ((i * 13) % 180) / 60,
	glucose: 85 + ((i * 11) % 20),
}));

const PIE_COLORS = ["#22c55e", "#ef4444", "#6366f1", "#f59e0b", "#06b6d4", "#3b82f6"];

function buildSleepPie(points: DayPoint[]) {
	const total = points.reduce((acc, p) => acc + p.sleepH, 0);
	return [
		{ name: "Ngủ sâu", value: +(total * 0.35).toFixed(1) },
		{ name: "Ngủ nông", value: +(total * 0.45).toFixed(1) },
		{ name: "REM", value: +(total * 0.2).toFixed(1) },
	];
}

export default function Page(): React.JSX.Element {
	const [selectedDate, setSelectedDate] = React.useState<string>(new Date().toISOString().slice(0, 10));
	const [type, setType] = React.useState<"all" | "vitals" | "activity" | "labs">("all");
	const [range, setRange] = React.useState<"7d" | "30d">("7d");
	const [statusFilter, setStatusFilter] = React.useState<"all" | HealthStatus>("all");

	const visible = React.useMemo(() => ALL_METRICS.filter((m) => (type === "all" ? true : m.group === type)), [type]);

	const visibleWithEval = React.useMemo(() => visible.map((m) => ({ metric: m, eval: evalMetric(m) })), [visible]);

	const filtered = React.useMemo(
		() => visibleWithEval.filter((x) => (statusFilter === "all" ? true : x.eval.status === statusFilter)),
		[visibleWithEval, statusFilter]
	);

	const series = range === "7d" ? data7d : data30d;
	const sleepPie = React.useMemo(() => buildSleepPie(series), [series]);

	return (
		<Grid container spacing={3}>
			{/* Hàng bộ lọc - tự co giãn khít chiều ngang với CSS Grid + auto-fit */}
			<Grid size={{ xs: 12 }}>
				<Box
					sx={{
						display: "grid",
						gap: 2,
						gridTemplateColumns: {
							xs: "1fr",
							sm: "repeat(2, minmax(200px, 1fr))",
							md: "repeat(auto-fit, minmax(220px, 1fr))",
						},
						alignItems: "center",
					}}
				>
					<TextField
						select
						size="small"
						label="Loại chỉ số"
						value={type}
						onChange={(e) => setType(e.target.value as any)}
					>
						<MenuItem value="all">Tất cả</MenuItem>
						<MenuItem value="vitals">Sinh tồn</MenuItem>
						<MenuItem value="activity">Hoạt động</MenuItem>
						<MenuItem value="labs">Xét nghiệm</MenuItem>
					</TextField>

					<TextField
						select
						size="small"
						label="Tình trạng"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as any)}
					>
						<MenuItem value="all">Tất cả</MenuItem>
						<MenuItem value="good">Tốt</MenuItem>
						<MenuItem value="normal">Bình thường</MenuItem>
						<MenuItem value="danger">Nguy hiểm</MenuItem>
					</TextField>

					<TextField
						type="date"
						size="small"
						label="Ngày"
						value={selectedDate}
						onChange={(e) => setSelectedDate(e.target.value)}
						InputLabelProps={{ shrink: true }}
					/>

					<TextField
						select
						size="small"
						label="Khoảng thời gian"
						value={range}
						onChange={(e) => setRange(e.target.value as "7d" | "30d")}
					>
						<MenuItem value="7d">7 ngày</MenuItem>
						<MenuItem value="30d">1 tháng</MenuItem>
					</TextField>
				</Box>
			</Grid>

			{/* Danh sách chỉ số + đánh giá */}
			{filtered.map(({ metric }) => (
				<Grid
					key={metric.key}
					size={{
						xs: 12,
						sm: 6,
						md: 4,
						lg: 3,
					}}
				>
					<MetricCard m={metric} />
				</Grid>
			))}

			{/* Charts */}
			<Grid size={{ xs: 12 }}>
				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 6 }}>
						<Card sx={{ height: 400, borderRadius: 2 }}>
							<CardContent sx={{ height: "100%" }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
									Bước đi theo ngày ({range === "7d" ? "7 ngày" : "30 ngày"})
								</Typography>
								<ResponsiveContainer width="100%" height="85%">
									<BarChart data={series}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="d" />
										<YAxis />
										<Tooltip />
										<Bar dataKey="steps" fill="#6366f1" />
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</Grid>

					<Grid size={{ xs: 12, md: 6 }}>
						<Card sx={{ height: 400, borderRadius: 2 }}>
							<CardContent sx={{ height: "100%" }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
									Nhịp tim (BPM) theo ngày
								</Typography>
								<ResponsiveContainer width="100%" height="85%">
									<LineChart data={series}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="d" />
										<YAxis />
										<Tooltip />
										<Legend />
										<Line type="monotone" dataKey="bpm" dot={false} />
									</LineChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</Grid>

					<Grid size={{ xs: 12, md: 6 }}>
						<Card sx={{ height: 400, borderRadius: 2 }}>
							<CardContent sx={{ height: "100%" }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
									Cấu trúc giấc ngủ ({range === "7d" ? "7 ngày" : "30 ngày"})
								</Typography>
								<ResponsiveContainer width="100%" height="85%">
									<PieChart>
										<Tooltip />
										<Legend />
										<Pie data={sleepPie} dataKey="value" nameKey="name" outerRadius={110} label>
											{sleepPie.map((_, i) => (
												<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
											))}
										</Pie>
									</PieChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</Grid>

					<Grid size={{ xs: 12, md: 6 }}>
						<Card sx={{ height: 400, borderRadius: 2 }}>
							<CardContent sx={{ height: "100%" }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
									SpO₂ & Đường huyết theo ngày
								</Typography>
								<ResponsiveContainer width="100%" height="85%">
									<LineChart data={series}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="d" />
										<YAxis />
										<Tooltip />
										<Legend />
										<Line type="monotone" dataKey="spo2" dot={false} />
										<Line type="monotone" dataKey="glucose" dot={false} />
									</LineChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
}
