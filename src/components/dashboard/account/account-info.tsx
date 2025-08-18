import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const athlete = {
	name: "Nguyen Van A",
	avatar: "/assets/avatar.png", // đặt ảnh đại diện của bạn ở đây nếu có
	nation: "Việt Nam",
	gender: "Nữ",
	birthday: "21/09/2000",
	age: "24 tuổi",
	events: "APW, SPW1, SPW, APMT",
} as const;

export function AccountInfo(): React.JSX.Element {
	return (
		<Card>
			<CardContent>
				<Stack spacing={2} sx={{ alignItems: "center" }}>
					<Avatar src={athlete.avatar} sx={{ height: 96, width: 96 }} />
					<Stack spacing={1} sx={{ textAlign: "center" }}>
						<Typography variant="h5">{athlete.name}</Typography>
						<Typography color="text.secondary" variant="body2">
							{athlete.nation}
						</Typography>
					</Stack>

					<Divider flexItem />

					<Stack spacing={0.5} sx={{ width: "100%" }}>
						<Typography variant="body2">
							<strong>Giới tính:</strong> {athlete.gender}
						</Typography>
						<Typography variant="body2">
							<strong>Ngày sinh:</strong> {athlete.birthday}
						</Typography>
						<Typography variant="body2">
							<strong>Tuổi:</strong> {athlete.age}
						</Typography>
						<Typography variant="body2">
							<strong>Sự kiện:</strong> {athlete.events}
						</Typography>
					</Stack>
				</Stack>
			</CardContent>

			<Divider />
			<CardActions>
				<Button fullWidth variant="text">
					Tải ảnh lên
				</Button>
			</CardActions>
		</Card>
	);
}
