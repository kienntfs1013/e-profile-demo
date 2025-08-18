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
	athlete: string;
};

export default function ClientPage({ initial }: { initial: Initial }): React.JSX.Element {
	const sp = useSearchParams();

	// Lấy từ query runtime nếu có; fallback về initial do server pass xuống
	const dLabel = sp.get("label") ?? initial.label;
	const dValue = sp.get("value") ?? initial.value;
	const athlete = sp.get("athlete") ?? initial.athlete;

	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Card>
				<CardHeader title="Xếp hạng thế giới" subheader="Sửa thông tin" />
				<Divider />
				<CardContent>
					<Stack spacing={2}>
						<FormControl fullWidth required>
							<InputLabel>Nội dung</InputLabel>
							<OutlinedInput label="Nội dung" name="label" defaultValue={dLabel} />
						</FormControl>
						<FormControl fullWidth required>
							<InputLabel>Hạng</InputLabel>
							<OutlinedInput type="number" label="Hạng" name="value" defaultValue={dValue} />
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
