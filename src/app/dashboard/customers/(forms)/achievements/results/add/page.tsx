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
	MenuItem,
	OutlinedInput,
	Select,
	Stack,
} from "@mui/material";

const groups = [
	"OLYMPIC GAMES",
	"WORLD CHAMPIONSHIPS",
	"WORLD CUP",
	"OLYMPIC QUALIFICATION CHAMPIONSHIP",
	"ASIAN CHAMPIONSHIPS",
] as const;

export default function Page(): React.JSX.Element {
	const sp = useSearchParams();
	const athlete = sp.get("athlete") || "";

	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Card>
				<CardHeader title="Thành tích thi đấu" subheader={`Nhập thông tin`} />
				<Divider />
				<CardContent>
					<Stack spacing={2}>
                        <FormControl fullWidth required>
							<InputLabel>Giải</InputLabel>
							<OutlinedInput label="Giải" name="group" />
						</FormControl>
						<FormControl fullWidth required>
							<InputLabel>Hạng</InputLabel>
							<OutlinedInput type="number" label="Hạng" name="rank" />
						</FormControl>
						<FormControl fullWidth required>
							<InputLabel>Thành phố</InputLabel>
							<OutlinedInput label="Thành phố" name="city" />
						</FormControl>
						<FormControl fullWidth required>
							<InputLabel>Nội dung</InputLabel>
							<OutlinedInput label="Nội dung" name="event" />
						</FormControl>
						<FormControl fullWidth>
							<InputLabel>Chi tiết</InputLabel>
							<OutlinedInput label="Chi tiết" name="detail" />
						</FormControl>
						<FormControl fullWidth required>
							<InputLabel>Năm</InputLabel>
							<OutlinedInput type="number" label="Năm" name="year" />
						</FormControl>
					</Stack>
				</CardContent>
				<Divider />
				<CardActions sx={{ justifyContent: "flex-end" }}>
					<Button variant="contained">Lưu</Button>
				</CardActions>
			</Card>
		</Stack>
	);
}
