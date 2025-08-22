"use client";

import * as React from "react";
import type { User } from "@/models/user";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
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

type Group = "vitals" | "activity" | "labs" | "all";
type StatusKey = "all" | "good" | "normal" | "danger";

type Metric = {
	key: string;
	label: string;
	value: string;
	unit?: string;
	helper?: string;
	icon: React.ElementType;
	color: string;
	badge?: string;
	group: Group;
};

const METRICS: Metric[] = [
	{
		key: "spo2",
		label: "Oxy trong máu",
		value: "98",
		unit: "%",
		icon: Drop,
		color: "#22c55e",
		badge: "✓",
		group: "vitals",
	},
	{
		key: "bpm",
		label: "Nhịp tim",
		value: "72",
		unit: "BPM",
		icon: Heartbeat,
		color: "#ef4444",
		badge: "✓",
		group: "vitals",
	},
	{ key: "bp", label: "Huyết áp", value: "118/76", unit: "mmHg", icon: Gauge, color: "#f97316", group: "vitals" },
	{ key: "temp", label: "Nhiệt độ", value: "36.6", unit: "°C", icon: Thermometer, color: "#3b82f6", group: "vitals" },
	{
		key: "glucose",
		label: "Đường huyết",
		value: "92",
		unit: "mg/dL",
		icon: Syringe,
		color: "#ef4444",
		badge: "!",
		group: "labs",
	},
	{
		key: "weight",
		label: "Cân nặng",
		value: "154.3",
		unit: "lb",
		icon: Scales,
		color: "#22c55e",
		badge: "↓",
		group: "vitals",
	},
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

const PIE_COLORS = ["#22c55e", "#ef4444", "#6366f1"];

function buildSleepPie(points: DayPoint[]) {
	const total = points.reduce((acc, p) => acc + p.sleepH, 0);
	return [
		{ name: "Ngủ sâu", value: +(total * 0.35).toFixed(1) },
		{ name: "Ngủ nông", value: +(total * 0.45).toFixed(1) },
		{ name: "REM", value: +(total * 0.2).toFixed(1) },
	];
}

function toNumber(v: string): number {
	return Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
}

function parseSleepHours(v: string): number {
	const m = /(\d+)\s*h(?:\s*(\d+)\s*m)?/i.exec(v);
	if (!m) return 0;
	const h = Number(m[1] || 0);
	const min = Number(m[2] || 0);
	return h + min / 60;
}

function parseBP(v: string): { sys: number; dia: number } {
	const [s, d] = v.split("/").map((x) => Number(x));
	return { sys: s || 0, dia: d || 0 };
}

function evaluateMetric(m: Metric): { key: StatusKey; label: string; color: "success" | "warning" | "error" } {
	switch (m.key) {
		case "spo2": {
			const n = toNumber(m.value);
			if (n >= 97) return { key: "good", label: "Tốt", color: "success" };
			if (n >= 94) return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "bpm": {
			const n = toNumber(m.value);
			if (n >= 60 && n <= 80) return { key: "good", label: "Tốt", color: "success" };
			if ((n > 80 && n <= 100) || (n >= 50 && n < 60)) return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "bp": {
			const { sys, dia } = parseBP(m.value);
			if (sys >= 90 && sys <= 120 && dia >= 60 && dia <= 80) return { key: "good", label: "Tốt", color: "success" };
			if ((sys > 120 && sys < 140) || (dia > 80 && dia < 90))
				return { key: "normal", label: "Bình thường", color: "warning" };
			if (sys >= 140 || dia >= 90 || sys < 85 || dia < 55) return { key: "danger", label: "Nguy hiểm", color: "error" };
			return { key: "normal", label: "Bình thường", color: "warning" };
		}
		case "temp": {
			const n = toNumber(m.value);
			if (n >= 36.4 && n <= 36.9) return { key: "good", label: "Tốt", color: "success" };
			if ((n >= 36.1 && n < 36.4) || (n > 36.9 && n <= 37.2))
				return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "glucose": {
			const n = toNumber(m.value); // mg/dL (giả định lúc đói)
			if (n >= 70 && n <= 99) return { key: "good", label: "Tốt", color: "success" };
			if ((n >= 100 && n <= 125) || (n >= 60 && n < 70))
				return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "sleep": {
			const h = parseSleepHours(m.value);
			if (h >= 7) return { key: "good", label: "Tốt", color: "success" };
			if (h >= 6) return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "steps": {
			const n = toNumber(m.value);
			if (n >= 7000) return { key: "good", label: "Tốt", color: "success" };
			if (n >= 4000) return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "hrv": {
			const n = toNumber(m.value);
			if (n >= 50) return { key: "good", label: "Tốt", color: "success" };
			if (n >= 35) return { key: "normal", label: "Bình thường", color: "warning" };
			return { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "ecg": {
			const ok = /bình thường|normal/i.test(m.value);
			return ok
				? { key: "good", label: "Tốt", color: "success" }
				: { key: "danger", label: "Nguy hiểm", color: "error" };
		}
		case "uric": {
			const n = toNumber(m.value);
			if (n > 7.2 || n < 2.5) return { key: "danger", label: "Nguy hiểm", color: "error" };
			if (n >= 5 && n <= 6.5) return { key: "good", label: "Tốt", color: "success" };
			return { key: "normal", label: "Bình thường", color: "warning" };
		}
		default:
			return { key: "normal", label: "Bình thường", color: "warning" };
	}
}

function StatCard({ m }: { m: Metric }) {
	const Icon = m.icon;
	const status = evaluateMetric(m);

	return (
		<Paper
			variant="outlined"
			sx={{
				p: 2,
				borderRadius: 2,
				height: "100%",
				display: "flex",
				flexDirection: "column",
				gap: 1,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
				<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
					{m.label}
				</Typography>

				<Box
					sx={{
						width: 36,
						height: 36,
						borderRadius: "999px",
						bgcolor: m.color,
						color: "#fff",
						display: "grid",
						placeItems: "center",
						flex: "0 0 auto",
					}}
				>
					<Icon weight="fill" />
				</Box>
			</Box>

			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
				<Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>
						{m.value}
					</Typography>
					{m.unit ? (
						<Typography variant="body2" color="text.secondary">
							{m.unit}
						</Typography>
					) : null}
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Chip size="small" color={status.color} label={status.label} />
				</Box>
			</Box>

			{m.helper ? (
				<Typography variant="caption" color="text.secondary">
					{m.helper}
				</Typography>
			) : null}
		</Paper>
	);
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
	return (
		<Card sx={{ height: 415, borderRadius: 2, minWidth: 0 }}>
			<CardContent sx={{ height: "100%" }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
					{title}
				</Typography>
				<Box sx={{ height: "80%" }}>
					{React.isValidElement(children) ? (
						<ResponsiveContainer width="100%" height="100%">
							{children}
						</ResponsiveContainer>
					) : (
						<Box sx={{ display: "grid", placeItems: "center", height: "100%" }}>
							<Typography variant="body2" color="text.secondary">
								Không có dữ liệu biểu đồ
							</Typography>
						</Box>
					)}
				</Box>
			</CardContent>
		</Card>
	);
}

export function HealthSection({ user }: { user: User }) {
	const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0, 10));
	const [range, setRange] = React.useState<"7d" | "30d">("7d");
	const [type, setType] = React.useState<Group>("all");
	const [status, setStatus] = React.useState<StatusKey>("all");

	const metrics = React.useMemo(() => {
		let data = METRICS.filter((x) => (type === "all" ? true : x.group === type));
		if (status !== "all") {
			data = data.filter((m) => evaluateMetric(m).key === status);
		}
		return data;
	}, [type, status]);

	const series = range === "7d" ? data7d : data30d;
	const sleepPie = React.useMemo(() => buildSleepPie(series), [series]);

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			<Box
				sx={{
					display: "grid",
					gap: 2,
					gridTemplateColumns: {
						xs: "1fr",
						md: "repeat(auto-fit, minmax(180px, 1fr))",
					},
					alignItems: "center",
				}}
			>
				<TextField
					select
					size="small"
					label="Loại chỉ số"
					value={type}
					onChange={(e) => setType(e.target.value as Group)}
				>
					<MenuItem value="all">Tất cả</MenuItem>
					<MenuItem value="vitals">Sinh tồn</MenuItem>
					<MenuItem value="activity">Hoạt động</MenuItem>
					<MenuItem value="labs">Xét nghiệm</MenuItem>
				</TextField>

				<TextField
					type="date"
					size="small"
					label="Ngày"
					value={date}
					onChange={(e) => setDate(e.target.value)}
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

				<TextField
					select
					size="small"
					label="Tình trạng"
					value={status}
					onChange={(e) => setStatus(e.target.value as StatusKey)}
				>
					<MenuItem value="all">Tất cả</MenuItem>
					<MenuItem value="good">Tốt</MenuItem>
					<MenuItem value="normal">Bình thường</MenuItem>
					<MenuItem value="danger">Nguy hiểm</MenuItem>
				</TextField>
			</Box>

			<Box
				sx={{
					display: "grid",
					gap: 2,
					alignItems: "stretch",
					gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
				}}
			>
				{metrics.map((m) => (
					<Box key={m.key} sx={{ minWidth: 0 }}>
						<StatCard m={m} />
					</Box>
				))}
			</Box>

			<Box
				sx={{
					display: "grid",
					gap: 2,
					gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
					alignItems: "stretch",
				}}
			>
				<Box sx={{ minWidth: 0 }}>
					<ChartCard title={`Bước đi theo ngày (${range === "7d" ? "7 ngày" : "30 ngày"})`}>
						{
							<BarChart data={series}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="d" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="steps" fill="#6366f1" />
							</BarChart>
						}
					</ChartCard>
				</Box>

				<Box sx={{ minWidth: 0 }}>
					<ChartCard title="Nhịp tim (BPM) theo ngày">
						{
							<LineChart data={series}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="d" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Line type="monotone" dataKey="bpm" dot={false} />
							</LineChart>
						}
					</ChartCard>
				</Box>

				<Box sx={{ minWidth: 0 }}>
					<ChartCard title={`Cấu trúc giấc ngủ (${range === "7d" ? "7 ngày" : "30 ngày"})`}>
						{
							<PieChart>
								<Tooltip />
								<Legend />
								<Pie data={sleepPie} dataKey="value" nameKey="name" outerRadius={110} label>
									{sleepPie.map((_, i) => (
										<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
									))}
								</Pie>
							</PieChart>
						}
					</ChartCard>
				</Box>

				<Box sx={{ minWidth: 0 }}>
					<ChartCard title="SpO₂ & Đường huyết theo ngày">
						{
							<LineChart data={series}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="d" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Line type="monotone" dataKey="spo2" dot={false} />
								<Line type="monotone" dataKey="glucose" dot={false} />
							</LineChart>
						}
					</ChartCard>
				</Box>
			</Box>
		</Box>
	);
}
