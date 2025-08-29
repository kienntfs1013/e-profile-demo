"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	buildImageUrl,
	fetchAthleteByUserId,
	fetchUserByIdFromList,
	getLoggedInUserId,
	mapGenderToVN,
	mapNationToCountry,
	mapSportToVN,
	parseRoleToInt,
	roleLabelFromInt,
	updateUserByIdMerged,
	type AthleteDTO,
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
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ArrowDownRight } from "@phosphor-icons/react/dist/ssr/ArrowDownRight";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { Barbell } from "@phosphor-icons/react/dist/ssr/Barbell";
import { HeartbeatIcon } from "@phosphor-icons/react/dist/ssr/Heartbeat";
import { ListBullets } from "@phosphor-icons/react/dist/ssr/ListBullets";
import { MedalIcon } from "@phosphor-icons/react/dist/ssr/Medal";

const nations = [{ value: "VIE", label: "Việt Nam" }] as const;
const sports = [
	{ value: "shooting", label: "Bắn súng" },
	{ value: "archery", label: "Bắn cung" },
	{ value: "taekwondo", label: "Taekwondo" },
	{ value: "boxing", label: "Boxing" },
] as const;

function SummaryCard(props: {
	title: string;
	value: string;
	icon: React.ReactNode;
	chip?: React.ReactNode;
	progress?: number;
	upDown?: "up" | "down";
	deltaText?: string;
	avatarBg: string;
	avatarFg?: string;
}) {
	const { title, value, icon, chip, progress, upDown, deltaText, avatarBg, avatarFg = "#fff" } = props;
	return (
		<Card sx={{ flex: 1, minWidth: 260, borderRadius: 3 }}>
			<CardContent>
				<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
					<Typography variant="overline" color="text.secondary" letterSpacing={1}>
						{title}
					</Typography>
					<Avatar
						sx={{
							width: 56,
							height: 56,
							bgcolor: "transparent",
							background: avatarBg,
							color: avatarFg,
							boxShadow: "0 6px 16px rgba(0,0,0,.15)",
						}}
					>
						{icon}
					</Avatar>
				</Stack>
				<Typography variant="h4" fontWeight={800} sx={{ mb: progress != null ? 1 : 0.5 }}>
					{value}
				</Typography>
				{progress != null ? (
					<LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, mb: 1 }} />
				) : null}
				<Stack direction="row" spacing={1} alignItems="center">
					{upDown === "up" ? (
						<ArrowUpRight size={18} color="#22c55e" />
					) : upDown === "down" ? (
						<ArrowDownRight size={18} color="#ef4444" />
					) : null}
					{deltaText ? (
						<Typography variant="body2" sx={{ color: upDown === "down" ? "#ef4444" : "#22c55e" }}>
							{deltaText}
						</Typography>
					) : null}
					{chip ? (
						<Typography variant="body2" color="text.secondary">
							{chip}
						</Typography>
					) : null}
				</Stack>
			</CardContent>
		</Card>
	);
}

type FormState = {
	avatar?: string;
	lastName: string;
	firstName: string;
	email: string;
	phone: string;
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

function vnToNationCode(country?: string): string {
	const s = (country || "").toLowerCase();
	return s.includes("việt") || s.includes("viet") ? "VIE" : "";
}
function normalizeGender(input?: string): FormState["gender"] {
	const s = (input || "").toLowerCase().trim();
	if (!s) return "";
	if (s.includes("nam") || s === "male") return "male";
	if (s.includes("nữ") || s.includes("nu") || s === "female") return "female";
	return "other";
}
function take<T>(...vals: (T | undefined | null)[]): T | undefined {
	for (const v of vals) if (v != null) return v as T;
	return undefined;
}

export default function Page(): React.JSX.Element {
	const router = useRouter();

	const [loading, setLoading] = React.useState(true);
	const [saving, setSaving] = React.useState(false);
	const [fetchError, setFetchError] = React.useState<string | null>(null);
	const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

	const [form, setForm] = React.useState<FormState>({
		avatar: undefined,
		lastName: "",
		firstName: "",
		email: "",
		phone: "",
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

	React.useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				setLoading(true);
				setFetchError(null);

				const uid = getLoggedInUserId();
				if (!uid) {
					setFetchError("Không xác định được ID người dùng");
					return;
				}

				const [user, athlete] = await Promise.all([
					fetchUserByIdFromList(uid),
					fetchAthleteByUserId(uid).catch(() => null),
				]);
				if (!user) {
					setFetchError("Không tìm thấy người dùng");
					return;
				}

				const firstName =
					take<string>(user.firstName, (athlete as AthleteDTO | null)?.first_name, user.email?.split("@")[0]) || "";
				const lastName = take<string>(user.lastName, (athlete as AthleteDTO | null)?.last_name) || "";
				const email = user.email || (athlete?.contact_email ?? "");
				const phone = take<string>(user.phoneNumber, athlete?.contact_phone) || "";
				const birthdayRaw = take<string>(user.birthday, athlete?.date_of_birth) || "";
				const birthday = birthdayRaw ? birthdayRaw.slice(0, 10) : "";
				const nation = vnToNationCode(take<string>(user.country, athlete?.nationality));
				const gender = normalizeGender(take<string>(user.gender, athlete?.gender));
				const sport = (user.sport || "").trim().toLowerCase();
				const sportValue =
					sport === "boxing"
						? "boxing"
						: sport === "archery" || sport === "bắn cung"
							? "archery"
							: sport === "taekwondo"
								? "taekwondo"
								: sport === "shooting" || sport === "bắn súng"
									? "shooting"
									: "";

				const avatar =
					buildImageUrl(user.profile_picture_path) ||
					buildImageUrl(athlete?.athlete_profile_picture_path) ||
					"/assets/noimagefound.png";

				const roleInt = parseRoleToInt(user.role);

				const nextForm: FormState = {
					avatar,
					lastName,
					firstName,
					email,
					phone,
					nation,
					gender,
					birthday,
					sport: sportValue,
					role: (roleInt as 1 | 2 | undefined) ?? "",
					address: user.address,
					district: user.district,
					city: user.city,
					national_id_card_no: user.national_id_card_no,
					passport_no: user.passport_no,
					passport_expiry_date: user.passport_expiry_date,
				};

				if (!cancelled) {
					setForm(nextForm);
					setAvatarUrl(nextForm.avatar);
				}
			} catch (e: any) {
				if (!cancelled) setFetchError(e?.message || "Không tải được dữ liệu");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, []);

	const handleSave = async () => {
		try {
			setSaving(true);
			setToast(null);

			const userId = getLoggedInUserId();
			if (!userId) {
				setToast({ type: "error", message: "Không xác định được ID người dùng" });
				return;
			}

			const current = await fetchUserByIdFromList(userId);
			if (!current) {
				setToast({ type: "error", message: "Không tìm thấy người dùng" });
				return;
			}

			await updateUserByIdMerged(userId, {
				firstName: form.firstName,
				lastName: form.lastName,
				email: form.email,
				phoneNumber: form.phone,
				gender: mapGenderToVN(form.gender),
				birthday: form.birthday || undefined,
				sport: mapSportToVN(form.sport) ?? current.sport,
				country: mapNationToCountry(form.nation) ?? current.country ?? "Việt Nam",
				role: form.role !== "" ? Number(form.role) : parseRoleToInt(current.role), // GỬI SỐ 1/2
				profile_picture_path: current.profile_picture_path,
				address: form.address || current.address,
				district: form.district || current.district,
				city: form.city || current.city,
				national_id_card_no: form.national_id_card_no || current.national_id_card_no,
				passport_no: form.passport_no || current.passport_no,
				passport_expiry_date: form.passport_expiry_date || current.passport_expiry_date,
				is_active: current.is_active ?? 1,
			});

			setFetchError(null);
			setToast({ type: "success", message: "Đã lưu thay đổi" });
		} catch (e: any) {
			const msg = e?.response?.data?.message || e?.message || "Lỗi kết nối Cơ Sở Dữ Liệu";
			setToast({ type: "error", message: msg });
		} finally {
			setSaving(false);
		}
	};

	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap flexWrap="wrap">
				<SummaryCard
					title="BUỔI TẬP (THÁNG NÀY)"
					value="24"
					icon={<Barbell size={26} weight="fill" />}
					upDown="up"
					deltaText="↑ 12% so với tháng trước"
					avatarBg="linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)"
				/>
				<SummaryCard
					title="CHỈ SỐ SỨC KHỎE"
					value="83/100"
					icon={<HeartbeatIcon size={26} weight="fill" />}
					upDown="down"
					deltaText="↓ 4% so với tháng trước"
					avatarBg="linear-gradient(135deg,#EC4899 0%,#F43F5E 100%)"
				/>
				<SummaryCard
					title="TIẾN ĐỘ GIÁO ÁN"
					value="75.5%"
					icon={<ListBullets size={26} weight="fill" />}
					progress={75.5}
					avatarBg="linear-gradient(135deg,#60A5FA 0%,#3B82F6 100%)"
				/>
				<SummaryCard
					title="THÀNH TÍCH"
					value="15 huy chương"
					icon={<MedalIcon size={26} weight="fill" />}
					avatarBg="linear-gradient(135deg,#F59E0B 0%,#F97316 100%)"
				/>
			</Stack>

			<Card sx={{ width: "100%" }}>
				<CardHeader title="Thông tin hồ sơ" />
				<Divider />
				<CardContent>
					{loading ? (
						<LinearProgress />
					) : fetchError ? (
						<Alert severity="error">{fetchError}</Alert>
					) : (
						<Stack spacing={2}>
							<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
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
											name="lastName"
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
											name="firstName"
											value={form.firstName}
											onChange={(e) => change("firstName", e.target.value)}
										/>
									</FormControl>
								</Box>
								<Box className="field">
									<FormControl fullWidth>
										<InputLabel>Email</InputLabel>
										<OutlinedInput
											type="email"
											label="Email"
											name="email"
											value={form.email}
											onChange={(e) => change("email", e.target.value)}
										/>
									</FormControl>
								</Box>
								<Box className="field">
									<FormControl fullWidth>
										<InputLabel>Số điện thoại</InputLabel>
										<OutlinedInput
											label="Số điện thoại"
											name="phone"
											value={form.phone}
											inputProps={{ inputMode: "tel" }}
											onChange={(e) => change("phone", e.target.value)}
										/>
									</FormControl>
								</Box>
								<Box className="field">
									<FormControl fullWidth required>
										<InputLabel>Quốc tịch</InputLabel>
										<Select
											label="Quốc tịch"
											name="nation"
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
											name="gender"
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
											name="birthday"
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
											name="sport"
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
											name="role"
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
											name="address"
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
											name="district"
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
											name="city"
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
											name="national_id_card_no"
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
											name="passport_no"
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
											name="passport_expiry_date"
											value={form.passport_expiry_date || ""}
											onChange={(e) => change("passport_expiry_date", e.target.value)}
										/>
									</FormControl>
								</Box>
							</Stack>
						</Stack>
					)}
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
					open={!!toast}
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
