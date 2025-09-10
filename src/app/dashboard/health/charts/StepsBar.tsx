"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function StepsBar({ data }: { data: any[] }) {
	return (
		<ResponsiveContainer width="100%" height={320}>
			<BarChart data={data}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="d" />
				<YAxis />
				<Tooltip />
				<Bar dataKey="steps" fill="#6366f1" />
			</BarChart>
		</ResponsiveContainer>
	);
}
