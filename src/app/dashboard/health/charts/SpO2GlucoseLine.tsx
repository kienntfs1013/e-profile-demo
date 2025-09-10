"use client";

import * as React from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SpO2GlucoseLine({ data }: { data: any[] }) {
	return (
		<ResponsiveContainer width="100%" height={320}>
			<LineChart data={data}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="d" />
				<YAxis />
				<Tooltip />
				<Legend />
				<Line type="monotone" dataKey="spo2" dot={false} />
				<Line type="monotone" dataKey="glucose" dot={false} />
			</LineChart>
		</ResponsiveContainer>
	);
}
