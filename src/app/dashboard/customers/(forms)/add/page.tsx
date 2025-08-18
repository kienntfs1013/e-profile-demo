"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
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

const nations = [{ value: "VIE", label: "Việt Nam" }] as const;
const sports = [
	{ value: "shooting", label: "Bắn súng" },
	{ value: "archery", label: "Bắn cung" },
	{ value: "taekwondo", label: "Taekwondo" },
	{ value: "boxing", label: "Boxing" },
] as const;

export default function Page(): React.JSX.Element {
	const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(undefined);
	const fileRef = React.useRef<HTMLInputElement>(null);

	const onPickFile = () => fileRef.current?.click();
	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f) setAvatarUrl(URL.createObjectURL(f));
	};

	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Card sx={{ width: "100%" }}>
				<CardHeader title="Thông tin hồ sơ" subheader="Điền thông tin bên dưới để tạo mới" />
				<Divider />
				<CardContent>
					<Stack spacing={3} sx={{ width: "100%" }}>
						<Stack direction="row" spacing={2} alignItems="center">
							<Avatar src={avatarUrl} sx={{ width: 96, height: 96 }} />
							<Stack direction="row" spacing={1}>
								<Button variant="outlined" onClick={onPickFile}>
									Tải ảnh lên
								</Button>
								{avatarUrl ? (
									<Button variant="text" color="error" onClick={() => setAvatarUrl(undefined)}>
										Xóa ảnh
									</Button>
								) : null}
							</Stack>
							<input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChange} />
						</Stack>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
							<FormControl fullWidth required>
								<InputLabel>Họ</InputLabel>
								<OutlinedInput label="Họ" name="lastName" />
							</FormControl>
							<FormControl fullWidth required>
								<InputLabel>Tên</InputLabel>
								<OutlinedInput label="Tên" name="firstName" />
							</FormControl>
						</Stack>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
							<FormControl fullWidth>
								<InputLabel>Email</InputLabel>
								<OutlinedInput type="email" label="Email" name="email" />
							</FormControl>
							<FormControl fullWidth>
								<InputLabel>Số điện thoại</InputLabel>
								<OutlinedInput label="Số điện thoại" name="phone" inputProps={{ inputMode: "tel" }} />
							</FormControl>
						</Stack>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
							<FormControl fullWidth required>
								<InputLabel>Quốc tịch</InputLabel>
								<Select label="Quốc tịch" name="nation" defaultValue="">
									<MenuItem value="" disabled>
										-- Chọn quốc tịch --
									</MenuItem>
									{nations.map((n) => (
										<MenuItem key={n.value} value={n.value}>
											{n.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<FormControl fullWidth required>
								<InputLabel>Giới tính</InputLabel>
								<Select label="Giới tính" name="gender" defaultValue="">
									<MenuItem value="" disabled>
										-- Chọn giới tính --
									</MenuItem>
									<MenuItem value="female">Nữ</MenuItem>
									<MenuItem value="male">Nam</MenuItem>
									<MenuItem value="other">Khác</MenuItem>
								</Select>
							</FormControl>
						</Stack>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
							<FormControl fullWidth required>
								<InputLabel shrink>Ngày sinh</InputLabel>
								<OutlinedInput type="date" label="Ngày sinh" name="birthday" />
							</FormControl>
							<FormControl fullWidth required>
								<InputLabel>Bộ môn</InputLabel>
								<Select label="Bộ môn" name="sport" defaultValue="">
									<MenuItem value="" disabled>
										-- Chọn bộ môn --
									</MenuItem>
									{sports.map((s) => (
										<MenuItem key={s.value} value={s.value}>
											{s.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Stack>
					</Stack>
				</CardContent>

				<Divider />
				<CardActions sx={{ justifyContent: "flex-end" }}>
					<Button variant="contained" type="submit">
						Lưu thay đổi
					</Button>
				</CardActions>
			</Card>
		</Stack>
	);
}
