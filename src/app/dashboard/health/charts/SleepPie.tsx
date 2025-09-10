"use client";

import * as React from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const PIE_COLORS = ["#22c55e", "#ef4444", "#6366f1", "#f59e0b", "#06b6d4", "#3b82f6"];

export default function SleepPie({ data }: { data: { name: string; value: number }[] }) {
	return (
		<ResponsiveContainer width="100%" height={320}>
			<PieChart>
				<Tooltip />
				<Legend />
				<Pie data={data} dataKey="value" nameKey="name" outerRadius={110} label>
					{data.map((_, i) => (
						<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
					))}
				</Pie>
			</PieChart>
		</ResponsiveContainer>
	);
}
