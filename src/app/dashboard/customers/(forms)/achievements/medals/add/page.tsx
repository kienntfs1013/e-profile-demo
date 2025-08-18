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

export default function Page(): React.JSX.Element {
	const sp = useSearchParams();
	const athlete = sp.get("athlete") || "";

	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Card>
				<CardHeader title="Huy chương" subheader={`Nhập thông tin`} />
				<Divider />
				<CardContent>
					<Stack spacing={2}>
						<FormControl fullWidth required>
							<InputLabel>Loại huy chương</InputLabel>
							<OutlinedInput label="Loại huy chương" name="label" />
						</FormControl>
						<FormControl fullWidth required>
							<InputLabel>Số lượng</InputLabel>
							<OutlinedInput type="number" label="Số lượng" name="value" />
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
