"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Divider,
	FormControl,
	InputLabel,
	OutlinedInput,
	Stack,
} from "@mui/material";

type Initial = {
	id: string;
	athlete: string;
	group: string;
	rank: string;
	city: string;
	event: string;
	detail: string;
	year: string;
};

export default function ClientPage({ initial }: { initial: Initial }): React.JSX.Element {
	const sp = useSearchParams();
	const dGroup = sp.get("group") ?? initial.group;
	const dRank = sp.get("rank") ?? initial.rank;
	const dCity = sp.get("city") ?? initial.city;
	const dEvent = sp.get("event") ?? initial.event;
	const dDetail = sp.get("detail") ?? initial.detail;
	const dYear = sp.get("year") ?? initial.year;
	const athlete = sp.get("athlete") ?? initial.athlete;

	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Card>
				<CardHeader title="Thành tích thi đấu" subheader="Sửa thông tin" />
				<Divider />
				<CardContent>
					<Stack spacing={2}>
						<FormControl fullWidth required>
							<InputLabel>Giải</InputLabel>
							<OutlinedInput label="Giải" name="group" defaultValue={dGroup} />
						</FormControl>
						<FormControl fullWidth required>
							<InputLabel>Hạng</InputLabel>
							<OutlinedInput type="number" label="Hạng" name="rank" defaultValue={dRank} />
						</FormControl>
						<FormControl fullWidth required>
							<InputLabel>Thành phố</InputLabel>
							<OutlinedInput label="Thành phố" name="city" defaultValue={dCity} />
						</FormControl>
						<FormControl fullWidth required>
							<InputLabel>Nội dung</InputLabel>
							<OutlinedInput label="Nội dung" name="event" defaultValue={dEvent} />
						</FormControl>
						<FormControl fullWidth>
							<InputLabel>Chi tiết</InputLabel>
							<OutlinedInput label="Chi tiết" name="detail" defaultValue={dDetail} />
						</FormControl>
						<FormControl fullWidth required>
							<InputLabel>Năm</InputLabel>
							<OutlinedInput type="number" label="Năm" name="year" defaultValue={dYear} />
						</FormControl>
					</Stack>
				</CardContent>
				<Divider />
				<CardActions sx={{ justifyContent: "flex-end" }}>
					<Button variant="contained">Lưu thay đổi</Button>
				</CardActions>
			</Card>
		</Stack>
	);
}
