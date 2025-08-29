"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	mapGenderToVN,
	mapNationToCountry,
	mapSportToVN,
	registerUser,
	roleLabelFromInt,
} from "@/services/user.service";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";

const nations = [{ value: "VIE", label: "Việt Nam" }] as const;
const sports = [
	{ value: "shooting", label: "Bắn súng" },
	{ value: "archery", label: "Bắn cung" },
	{ value: "taekwondo", label: "Taekwondo" },
	{ value: "boxing", label: "Boxing" },
] as const;

type FormState = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	password: string;
	password2: string;
	nation: string;
	gender: "female" | "male" | "other" | "";
	birthday: string;
	sport: string;
	role: 1 | 2 | "";
	address?: string;
	district?: string;
	city?: string;
	national_id_card_no?: string;
	passport_no?: string;
	passport_expiry_date?: string;
};

function isValidEmail(v: string): boolean {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
	return re.test(v.trim());
}

export default function Page(): React.JSX.Element {
	const router = useRouter();

	const [saving, setSaving] = React.useState(false);
	const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
	const [emailError, setEmailError] = React.useState<string | null>(null);

	const [form, setForm] = React.useState<FormState>({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		password: "",
		password2: "",
		nation: "",
		gender: "",
		birthday: "",
		sport: "",
		role: "",
		address: "",
		district: "",
		city: "",
		national_id_card_no: "",
		passport_no: "",
		passport_expiry_date: "",
	});

	const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(undefined);
	const fileRef = React.useRef<HTMLInputElement>(null);
	const onPickFile = () => fileRef.current?.click();
	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f) setAvatarUrl(URL.createObjectURL(f));
	};
	const change = <K extends keyof FormState>(key: K, val: FormState[K]) => setForm((p) => ({ ...p, [key]: val }));

	const handleSave = async () => {
		try {
			if (!form.firstName || !form.lastName || !form.email || !form.password || !form.password2 || !form.role) {
				setToast({ type: "error", message: "Vui lòng nhập đủ các trường bắt buộc" });
				return;
			}
			if (!isValidEmail(form.email)) {
				setEmailError("Email không hợp lệ");
				setToast({ type: "error", message: "Email không hợp lệ" });
				return;
			}
			if (form.password !== form.password2) {
				setToast({ type: "error", message: "Mật khẩu nhập lại không khớp" });
				return;
			}

			setSaving(true);
			setToast(null);

			const res = await registerUser({
				firstName: form.firstName,
				lastName: form.lastName,
				email: form.email.trim(),
				password: form.password,
				phoneNumber: form.phone || undefined,
				role: form.role,
				gender: mapGenderToVN(form.gender),
				birthday: form.birthday || undefined,
				sport: mapSportToVN(form.sport),
				country: mapNationToCountry(form.nation),
				address: form.address || undefined,
				district: form.district || undefined,
				city: form.city || undefined,
				national_id_card_no: form.national_id_card_no || undefined,
				passport_no: form.passport_no || undefined,
				passport_expiry_date: form.passport_expiry_date || undefined,
				profile_picture_path: undefined,
			});

			if (!res.ok || !res.id) {
				setToast({ type: "error", message: res.message || "Tạo người dùng thất bại" });
				return;
			}

			setToast({ type: "success", message: "Tạo người dùng thành công" });
			setTimeout(() => router.push(`/dashboard/customers/${res.id}`), 300);
		} catch (e: any) {
			const msg = e?.response?.data?.message || e?.message || "Lỗi kết nối Cơ Sở Dữ Liệu";
			setToast({ type: "error", message: msg });
		} finally {
			setSaving(false);
		}
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

						<Stack
							direction="row"
							spacing={2}
							useFlexGap
							flexWrap="wrap"
							sx={{ "& > .field": { flex: "1 1 320px", minWidth: 260 } }}
						>
							<Box className="field">
								<FormControl fullWidth required>
									<InputLabel>Họ</InputLabel>
									<OutlinedInput
										label="Họ"
										value={form.lastName}
										onChange={(e) => change("lastName", e.target.value)}
									/>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth required>
									<InputLabel>Tên</InputLabel>
									<OutlinedInput
										label="Tên"
										value={form.firstName}
										onChange={(e) => change("firstName", e.target.value)}
									/>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth required error={Boolean(emailError)}>
									<InputLabel>Email</InputLabel>
									<OutlinedInput
										type="email"
										label="Email"
										value={form.email}
										onChange={(e) => {
											const v = e.target.value;
											change("email", v);
											setEmailError(v ? (isValidEmail(v) ? null : "Email không hợp lệ") : "Email không hợp lệ");
										}}
										onBlur={() => setEmailError(isValidEmail(form.email) ? null : "Email không hợp lệ")}
									/>
									{emailError ? <FormHelperText>{emailError}</FormHelperText> : null}
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth>
									<InputLabel>Số điện thoại</InputLabel>
									<OutlinedInput
										label="Số điện thoại"
										value={form.phone}
										inputProps={{ inputMode: "tel" }}
										onChange={(e) => change("phone", e.target.value)}
									/>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth required>
									<InputLabel>Mật khẩu</InputLabel>
									<OutlinedInput
										type="password"
										label="Mật khẩu"
										value={form.password}
										onChange={(e) => change("password", e.target.value)}
									/>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth required>
									<InputLabel>Nhập lại mật khẩu</InputLabel>
									<OutlinedInput
										type="password"
										label="Nhập lại mật khẩu"
										value={form.password2}
										onChange={(e) => change("password2", e.target.value)}
									/>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth required>
									<InputLabel>Quốc tịch</InputLabel>
									<Select
										label="Quốc tịch"
										value={form.nation}
										onChange={(e) => change("nation", e.target.value as FormState["nation"])}
									>
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
							</Box>
							<Box className="field">
								<FormControl fullWidth required>
									<InputLabel>Giới tính</InputLabel>
									<Select
										label="Giới tính"
										value={form.gender}
										onChange={(e) => change("gender", e.target.value as FormState["gender"])}
									>
										<MenuItem value="" disabled>
											-- Chọn giới tính --
										</MenuItem>
										<MenuItem value="female">Nữ</MenuItem>
										<MenuItem value="male">Nam</MenuItem>
										<MenuItem value="other">Khác</MenuItem>
									</Select>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth required>
									<InputLabel shrink>Ngày sinh</InputLabel>
									<OutlinedInput
										type="date"
										label="Ngày sinh"
										value={form.birthday}
										onChange={(e) => change("birthday", e.target.value)}
									/>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth required>
									<InputLabel>Bộ môn</InputLabel>
									<Select
										label="Bộ môn"
										value={form.sport}
										onChange={(e) => change("sport", e.target.value as FormState["sport"])}
									>
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
							</Box>
							<Box className="field">
								<FormControl fullWidth required>
									<InputLabel>Vai trò</InputLabel>
									<Select
										label="Vai trò"
										value={form.role === "" ? "" : Number(form.role)}
										onChange={(e) => change("role", Number(e.target.value) as 1 | 2)}
									>
										<MenuItem value="" disabled>
											-- Chọn vai trò --
										</MenuItem>
										<MenuItem value={1}>{roleLabelFromInt(1)}</MenuItem>
										<MenuItem value={2}>{roleLabelFromInt(2)}</MenuItem>
									</Select>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth>
									<InputLabel>Địa chỉ</InputLabel>
									<OutlinedInput
										label="Địa chỉ"
										value={form.address || ""}
										onChange={(e) => change("address", e.target.value)}
									/>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth>
									<InputLabel>Quận/Huyện</InputLabel>
									<OutlinedInput
										label="Quận/Huyện"
										value={form.district || ""}
										onChange={(e) => change("district", e.target.value)}
									/>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth>
									<InputLabel>Tỉnh/Thành</InputLabel>
									<OutlinedInput
										label="Tỉnh/Thành"
										value={form.city || ""}
										onChange={(e) => change("city", e.target.value)}
									/>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth>
									<InputLabel>CMND/CCCD</InputLabel>
									<OutlinedInput
										label="CMND/CCCD"
										value={form.national_id_card_no || ""}
										onChange={(e) => change("national_id_card_no", e.target.value)}
									/>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth>
									<InputLabel>Hộ chiếu</InputLabel>
									<OutlinedInput
										label="Hộ chiếu"
										value={form.passport_no || ""}
										onChange={(e) => change("passport_no", e.target.value)}
									/>
								</FormControl>
							</Box>
							<Box className="field">
								<FormControl fullWidth>
									<InputLabel shrink>Hạn hộ chiếu</InputLabel>
									<OutlinedInput
										type="date"
										label="Hạn hộ chiếu"
										value={form.passport_expiry_date || ""}
										onChange={(e) => change("passport_expiry_date", e.target.value)}
									/>
								</FormControl>
							</Box>
						</Stack>
					</Stack>
				</CardContent>

				<Divider />
				<CardActions sx={{ justifyContent: "flex-end" }}>
					<Button variant="contained" type="button" disabled={saving} onClick={handleSave}>
						{saving ? "Đang lưu..." : "Lưu thay đổi"}
					</Button>
				</CardActions>
			</Card>

			{toast ? (
				<Snackbar
					open
					autoHideDuration={3000}
					onClose={() => setToast(null)}
					anchorOrigin={{ vertical: "top", horizontal: "right" }}
				>
					<Alert severity={toast.type}>{toast.message}</Alert>
				</Snackbar>
			) : null}
		</Stack>
	);
}
