"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import dayjs from "dayjs";

type Initial = {
	id: string;
	score: string;
	time: string;
	x: string;
	y: string;
	date: string;
	status: string;
};

export default function ClientPage({ initial }: { initial: Initial }): React.JSX.Element {
	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Card>
				<CardHeader title="Điểm luyện tập" subheader="Sửa thông tin" />
				<Divider />
				<CardContent>
					<Stack spacing={3}>
						<FormControl fullWidth disabled>
							<InputLabel>Mã phát</InputLabel>
							<OutlinedInput label="Mã phát" defaultValue={initial.id} />
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Số điểm</InputLabel>
							<OutlinedInput
								label="Số điểm"
								name="score"
								type="number"
								defaultValue={initial.score}
								inputProps={{ step: "0.1" }}
							/>
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Thời gian</InputLabel>
							<OutlinedInput label="Thời gian" name="time" defaultValue={initial.time} />
						</FormControl>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
							<FormControl fullWidth>
								<InputLabel>Lệch X (mm)</InputLabel>
								<OutlinedInput
									label="Lệch X (mm)"
									name="x"
									type="number"
									defaultValue={initial.x}
									inputProps={{ step: "0.01" }}
								/>
							</FormControl>
							<FormControl fullWidth>
								<InputLabel>Lệch Y (mm)</InputLabel>
								<OutlinedInput
									label="Lệch Y (mm)"
									name="y"
									type="number"
									defaultValue={initial.y}
									inputProps={{ step: "0.01" }}
								/>
							</FormControl>
						</Stack>

						<FormControl fullWidth>
							<InputLabel shrink>Ngày giờ</InputLabel>
							<OutlinedInput
								type="datetime-local"
								label="Ngày giờ"
								name="date"
								defaultValue={initial.date ? dayjs(initial.date).format("YYYY-MM-DDTHH:mm") : ""}
							/>
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
