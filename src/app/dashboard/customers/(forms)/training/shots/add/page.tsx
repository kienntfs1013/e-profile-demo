"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function Page(): React.JSX.Element {
	const params = useSearchParams();
	const athlete = params.get("athlete") ?? "";

	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Card>
				<CardHeader title="Điểm luyện tập" subheader="Nhập thông tin" />
				<Divider />
				<CardContent>
					<Stack spacing={3}>
						<FormControl fullWidth>
							<InputLabel>Mã phát</InputLabel>
							<OutlinedInput label="Mã phát" name="id" placeholder="PHAT-001" />
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Số điểm</InputLabel>
							<OutlinedInput label="Số điểm" name="score" type="number" inputProps={{ step: "0.1" }} />
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Thời gian</InputLabel>
							<OutlinedInput label="Thời gian" name="time" placeholder="mm:ss.ms" />
						</FormControl>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
							<FormControl fullWidth>
								<InputLabel>Lệch X (mm)</InputLabel>
								<OutlinedInput label="Lệch X (mm)" name="x" type="number" inputProps={{ step: "0.01" }} />
							</FormControl>
							<FormControl fullWidth>
								<InputLabel>Lệch Y (mm)</InputLabel>
								<OutlinedInput label="Lệch Y (mm)" name="y" type="number" inputProps={{ step: "0.01" }} />
							</FormControl>
						</Stack>

						<FormControl fullWidth>
							<InputLabel shrink>Ngày giờ</InputLabel>
							<OutlinedInput type="datetime-local" label="Ngày giờ" name="date" />
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
