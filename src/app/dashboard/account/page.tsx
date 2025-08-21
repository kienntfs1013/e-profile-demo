"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { users, type User } from "@/models/user";
import Avatar from "@mui/material/Avatar";
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

function splitVNName(full = "") {
	const parts = full.trim().split(/\s+/);
	if (parts.length === 0) return { lastName: "", firstName: "" };
	const [lastName, ...rest] = parts;
	return { lastName, firstName: rest.join(" ") };
}

function toNation(u?: User) {
	if (u?.address?.country === "VN") return "VIE";
	return "";
}

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

export default function Page(): React.JSX.Element {
	const router = useRouter();
	const { id } = useParams<{ id: string }>();

	const athlete: User | undefined = React.useMemo(() => users.find((u) => u.id === "ATH-001"), [id]);

	const defaults = React.useMemo(() => {
		const { lastName, firstName } = splitVNName(athlete?.name ?? "");
		return {
			avatar: athlete?.avatar || undefined,
			lastName,
			firstName,
			email: athlete?.email ?? "",
			phone: athlete?.phone ?? "",
			nation: toNation(athlete),
			gender: athlete?.gender ?? "",
			birthday: athlete?.birthday ?? "",
			sport: athlete?.sport ?? "",
		};
	}, [athlete]);

	const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(defaults.avatar);
	const fileRef = React.useRef<HTMLInputElement>(null);
	const onPickFile = () => fileRef.current?.click();
	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f) setAvatarUrl(URL.createObjectURL(f));
	};

	if (!athlete) {
		return (
			<Stack spacing={3} sx={{ width: "100%" }}>
				<Card>
					<CardContent>
						<Stack spacing={2} alignItems="center" textAlign="center">
							<Typography variant="h5">Không tìm thấy vận động viên</Typography>
							<Typography variant="body2" color="text.secondary">
								Mã: {id}
							</Typography>
							<Button variant="outlined" onClick={() => router.push("/dashboard/customers")}>
								Quay lại danh sách
							</Button>
						</Stack>
					</CardContent>
				</Card>
			</Stack>
		);
	}

	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap flexWrap="wrap">
				<SummaryCard
					title="BUỔI TẬP (THÁNG NÀY)"
					value="24"
					icon={<Barbell size={26} weight="fill" />}
					upDown="up"
					deltaText="↑ 12% so với tháng trước"
					chip={<span>Khối lượng ổn định</span>}
					avatarBg="linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)"
				/>
				<SummaryCard
					title="CHỈ SỐ SỨC KHỎE"
					value="83/100"
					icon={<HeartbeatIcon size={26} weight="fill" />}
					upDown="down"
					deltaText="↓ 4% so với tháng trước"
					chip={<span>Cần theo dõi hồi phục</span>}
					avatarBg="linear-gradient(135deg,#EC4899 0%,#F43F5E 100%)"
				/>
				<SummaryCard
					title="TIẾN ĐỘ GIÁO ÁN"
					value="75.5%"
					icon={<ListBullets size={26} weight="fill" />}
					progress={75.5}
					chip={<span>Tuần hiện tại</span>}
					avatarBg="linear-gradient(135deg,#60A5FA 0%,#3B82F6 100%)"
				/>

				<SummaryCard
					title="THÀNH TÍCH"
					value="15 huy chương"
					icon={<MedalIcon size={26} weight="fill" />}
					chip={<span>Mùa giải 2024–2025</span>}
					avatarBg="linear-gradient(135deg,#F59E0B 0%,#F97316 100%)"
				/>
			</Stack>

			<Card sx={{ width: "100%" }}>
				<CardHeader title="Thông tin hồ sơ" />
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
								<OutlinedInput label="Họ" name="lastName" defaultValue={defaults.lastName} />
							</FormControl>
							<FormControl fullWidth required>
								<InputLabel>Tên</InputLabel>
								<OutlinedInput label="Tên" name="firstName" defaultValue={defaults.firstName} />
							</FormControl>
						</Stack>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
							<FormControl fullWidth>
								<InputLabel>Email</InputLabel>
								<OutlinedInput type="email" label="Email" name="email" defaultValue={defaults.email} />
							</FormControl>
							<FormControl fullWidth>
								<InputLabel>Số điện thoại</InputLabel>
								<OutlinedInput
									label="Số điện thoại"
									name="phone"
									defaultValue={defaults.phone}
									inputProps={{ inputMode: "tel" }}
								/>
							</FormControl>
						</Stack>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
							<FormControl fullWidth required>
								<InputLabel>Quốc tịch</InputLabel>
								<Select label="Quốc tịch" name="nation" defaultValue={defaults.nation}>
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
								<Select label="Giới tính" name="gender" defaultValue={defaults.gender}>
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
								<OutlinedInput type="date" label="Ngày sinh" name="birthday" defaultValue={defaults.birthday} />
							</FormControl>

							<FormControl fullWidth required>
								<InputLabel>Bộ môn</InputLabel>
								<Select label="Bộ môn" name="sport" defaultValue={defaults.sport}>
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
