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
	label: string;
	value: string;
	color: string;
	athlete: string;
};

export default function ClientPage({ initial }: { initial: Initial }): React.JSX.Element {
	const sp = useSearchParams();

	const dLabel = sp.get("label") ?? initial.label;
	const dValue = sp.get("value") ?? initial.value;
	const dColor = sp.get("color") ?? initial.color;
	const athlete = sp.get("athlete") ?? initial.athlete;

	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Card>
				<CardHeader title="Huy chương" subheader="Sửa thông tin" />
				<Divider />
				<CardContent>
					<Stack spacing={2}>
						<FormControl fullWidth required>
							<InputLabel>Loại huy chương</InputLabel>
							<OutlinedInput label="Loại huy chương" name="label" defaultValue={dLabel} />
						</FormControl>
						<FormControl fullWidth required>
							<InputLabel>Số lượng</InputLabel>
							<OutlinedInput type="number" label="Số lượng" name="value" defaultValue={dValue} />
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
