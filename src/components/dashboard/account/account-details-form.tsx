"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";

const nations = [{ value: "VIE", label: "Việt Nam" }] as const;

export function AccountDetailsForm(): React.JSX.Element {
	return (
		<form onSubmit={(e) => e.preventDefault()}>
			<Card>
				<CardHeader title="Thông tin hồ sơ" subheader="Bạn có thể chỉnh sửa các trường bên dưới" />
				<Divider />
				<CardContent>
					<Grid container spacing={3}>
						<Grid size={{ md: 6, xs: 12 }}>
							<FormControl fullWidth required>
								<InputLabel>Họ</InputLabel>
								<OutlinedInput defaultValue="Nguyen" label="Họ" name="lastName" />
							</FormControl>
						</Grid>
						<Grid size={{ md: 6, xs: 12 }}>
							<FormControl fullWidth required>
								<InputLabel>Tên</InputLabel>
								<OutlinedInput defaultValue="Van A" label="Tên" name="firstName" />
							</FormControl>
						</Grid>

						<Grid size={{ md: 6, xs: 12 }}>
							<FormControl fullWidth required>
								<InputLabel>Quốc tịch</InputLabel>
								<Select defaultValue="VIE" label="Quốc tịch" name="nation">
									{nations.map((n) => (
										<MenuItem key={n.value} value={n.value}>
											{n.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid size={{ md: 6, xs: 12 }}>
							<FormControl fullWidth required>
								<InputLabel>Giới tính</InputLabel>
								<Select defaultValue="female" label="Giới tính" name="gender">
									<MenuItem value="female">Nữ</MenuItem>
									<MenuItem value="male">Nam</MenuItem>
									<MenuItem value="other">Khác</MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid size={{ md: 6, xs: 12 }}>
							<FormControl fullWidth required>
								<InputLabel shrink>Ngày sinh</InputLabel>
								<OutlinedInput type="date" defaultValue="2000-09-21" label="Ngày sinh" name="birthday" />
							</FormControl>
						</Grid>

						<Grid size={{ md: 6, xs: 12 }}>
							<FormControl fullWidth>
								<InputLabel>Tuổi</InputLabel>
								<OutlinedInput defaultValue="24" label="Tuổi" name="age" />
							</FormControl>
						</Grid>

						<Grid size={{ md: 12, xs: 12 }}>
							<FormControl fullWidth>
								<InputLabel>Sự kiện (mã)</InputLabel>
								<OutlinedInput defaultValue="APW, SPW1, SPW, APMT" label="Sự kiện (mã)" name="events" />
							</FormControl>
						</Grid>
					</Grid>
				</CardContent>

				<Divider />
				<CardActions sx={{ justifyContent: "flex-end" }}>
					<Button variant="contained">Lưu thay đổi</Button>
				</CardActions>
			</Card>
		</form>
	);
}
