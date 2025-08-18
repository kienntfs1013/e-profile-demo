"use client";

import * as React from "react";
import RouterLink from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import type { Resolver, SubmitHandler } from "react-hook-form";

import { paths } from "@/paths";
import { authClient } from "@/lib/auth/client";
import { useUser } from "@/hooks/use-user";

const roleOptions = ["Vận động viên", "HLV", "Cục Thể dục Thể thao", "Khác"] as const;
const statusOptions = ["Đang hoạt động", "Tạm ngưng"] as const;
const sports = [
	{ value: "shooting", label: "Bắn súng" },
	{ value: "archery", label: "Bắn cung" },
	{ value: "taekwondo", label: "Taekwondo" },
	{ value: "boxing", label: "Boxing" },
] as const;

const schema = zod
	.object({
		firstName: zod.string().min(1, { message: "Họ là bắt buộc" }),
		lastName: zod.string().min(1, { message: "Tên là bắt buộc" }),
		email: zod.string().min(1, { message: "Email là bắt buộc" }).email("Email không hợp lệ"),
		phone: zod.string().min(1, { message: "Số điện thoại là bắt buộc" }),
		role: zod.enum(roleOptions, { required_error: "Vai trò là bắt buộc" }),
		status: zod.enum(statusOptions, { required_error: "Trạng thái là bắt buộc" }),
		gender: zod.enum(["female", "male", "other"], { required_error: "Giới tính là bắt buộc" }),
		birthday: zod.string().min(1, { message: "Ngày sinh là bắt buộc" }),
		sport: zod.enum(sports.map((s) => s.value) as [string, ...string[]], { required_error: "Bộ môn là bắt buộc" }),
		age: zod
			.preprocess(
				(v) => (v === "" || v === undefined ? undefined : Number(v)),
				zod.number().int().min(0).max(120).optional()
			)
			.optional(),
		addressStreet: zod.string().optional(),
		addressCity: zod.string().optional(),
		addressState: zod.string().optional(),
		addressCountry: zod.string().optional(),
		password: zod.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" }),
		confirmPassword: zod.string().min(6, { message: "Nhập lại mật khẩu tối thiểu 6 ký tự" }),
		terms: zod.boolean().refine((value) => value, "Bạn cần chấp nhận điều khoản sử dụng"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Mật khẩu nhập lại không khớp",
	});

type Values = zod.infer<typeof schema>;

const defaultValues: Values = {
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
	role: "Vận động viên",
	status: "Đang hoạt động",
	gender: "female",
	birthday: "",
	sport: "shooting",
	age: undefined,
	addressStreet: "",
	addressCity: "",
	addressState: "",
	addressCountry: "VN",
	password: "",
	confirmPassword: "",
	terms: false,
};

export function SignUpForm(): React.JSX.Element {
	const router = useRouter();
	const { checkSession } = useUser();
	const [isPending, setIsPending] = React.useState<boolean>(false);

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

	const onSubmit = React.useCallback(
		async (values: Values): Promise<void> => {
			setIsPending(true);
			const payload = {
				...values,
				name: `${values.firstName} ${values.lastName}`.trim(),
				address: {
					street: values.addressStreet || undefined,
					city: values.addressCity || undefined,
					state: values.addressState || undefined,
					country: values.addressCountry || undefined,
				},
			};
			const { error } = await authClient.signUp(payload as any);
			if (error) {
				setError("root", { type: "server", message: error });
				setIsPending(false);
				return;
			}
			await checkSession?.();
			router.refresh();
		},
		[checkSession, router, setError]
	);

	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">Đăng ký</Typography>
				<Typography color="text.secondary" variant="body2">
					Đã có tài khoản?{" "}
					<Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
						Đăng nhập
					</Link>
				</Typography>
			</Stack>

			<form onSubmit={handleSubmit(onSubmit)} noValidate>
				<Stack spacing={2}>
					<Controller
						control={control}
						name="firstName"
						render={({ field }) => (
							<FormControl error={Boolean(errors.firstName)}>
								<InputLabel>Họ</InputLabel>
								<OutlinedInput {...field} label="Họ" />
								{errors.firstName ? <FormHelperText>{errors.firstName.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>

					<Controller
						control={control}
						name="lastName"
						render={({ field }) => (
							<FormControl error={Boolean(errors.lastName)}>
								<InputLabel>Tên</InputLabel>
								<OutlinedInput {...field} label="Tên" />
								{errors.lastName ? <FormHelperText>{errors.lastName.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>

					<Controller
						control={control}
						name="email"
						render={({ field }) => (
							<FormControl error={Boolean(errors.email)}>
								<InputLabel>Địa chỉ email</InputLabel>
								<OutlinedInput {...field} label="Địa chỉ email" type="email" autoComplete="email" />
								{errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>

					<Controller
						control={control}
						name="phone"
						render={({ field }) => (
							<FormControl error={Boolean(errors.phone)}>
								<InputLabel>Số điện thoại</InputLabel>
								<OutlinedInput {...field} label="Số điện thoại" inputMode="tel" />
								{errors.phone ? <FormHelperText>{errors.phone.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<Controller
							control={control}
							name="role"
							render={({ field }) => (
								<FormControl fullWidth error={Boolean(errors.role)}>
									<InputLabel>Vai trò</InputLabel>
									<Select {...field} label="Vai trò">
										{roleOptions.map((r) => (
											<MenuItem key={r} value={r}>
												{r}
											</MenuItem>
										))}
									</Select>
									{errors.role ? <FormHelperText>{errors.role.message}</FormHelperText> : null}
								</FormControl>
							)}
						/>
						<Controller
							control={control}
							name="status"
							render={({ field }) => (
								<FormControl fullWidth error={Boolean(errors.status)}>
									<InputLabel>Trạng thái</InputLabel>
									<Select {...field} label="Trạng thái">
										{statusOptions.map((s) => (
											<MenuItem key={s} value={s}>
												{s}
											</MenuItem>
										))}
									</Select>
									{errors.status ? <FormHelperText>{errors.status.message}</FormHelperText> : null}
								</FormControl>
							)}
						/>
					</Stack>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<Controller
							control={control}
							name="gender"
							render={({ field }) => (
								<FormControl fullWidth error={Boolean(errors.gender)}>
									<InputLabel>Giới tính</InputLabel>
									<Select {...field} label="Giới tính">
										<MenuItem value="female">Nữ</MenuItem>
										<MenuItem value="male">Nam</MenuItem>
										<MenuItem value="other">Khác</MenuItem>
									</Select>
									{errors.gender ? <FormHelperText>{errors.gender.message}</FormHelperText> : null}
								</FormControl>
							)}
						/>
						<Controller
							control={control}
							name="birthday"
							render={({ field }) => (
								<FormControl fullWidth error={Boolean(errors.birthday)}>
									<InputLabel shrink>Ngày sinh</InputLabel>
									<OutlinedInput {...field} type="date" label="Ngày sinh" />
									{errors.birthday ? <FormHelperText>{errors.birthday.message}</FormHelperText> : null}
								</FormControl>
							)}
						/>
					</Stack>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<Controller
							control={control}
							name="sport"
							render={({ field }) => (
								<FormControl fullWidth error={Boolean(errors.sport)}>
									<InputLabel>Bộ môn</InputLabel>
									<Select {...field} label="Bộ môn">
										{sports.map((s) => (
											<MenuItem key={s.value} value={s.value}>
												{s.label}
											</MenuItem>
										))}
									</Select>
									{errors.sport ? <FormHelperText>{errors.sport.message}</FormHelperText> : null}
								</FormControl>
							)}
						/>
						<Controller
							control={control}
							name="age"
							render={({ field }) => (
								<FormControl fullWidth error={Boolean(errors.age)}>
									<InputLabel>Tuổi</InputLabel>
									<OutlinedInput {...field} type="number" inputProps={{ min: 0, max: 120 }} label="Tuổi" />
									{errors.age ? <FormHelperText>{errors.age.message as string}</FormHelperText> : null}
								</FormControl>
							)}
						/>
					</Stack>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<Controller
							control={control}
							name="addressStreet"
							render={({ field }) => (
								<FormControl fullWidth>
									<InputLabel>Địa chỉ (số, đường)</InputLabel>
									<OutlinedInput {...field} label="Địa chỉ (số, đường)" />
								</FormControl>
							)}
						/>
						<Controller
							control={control}
							name="addressCity"
							render={({ field }) => (
								<FormControl fullWidth>
									<InputLabel>Thành phố</InputLabel>
									<OutlinedInput {...field} label="Thành phố" />
								</FormControl>
							)}
						/>
					</Stack>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<Controller
							control={control}
							name="addressState"
							render={({ field }) => (
								<FormControl fullWidth>
									<InputLabel>Tỉnh/Quận</InputLabel>
									<OutlinedInput {...field} label="Tỉnh/Quận" />
								</FormControl>
							)}
						/>
						<Controller
							control={control}
							name="addressCountry"
							render={({ field }) => (
								<FormControl fullWidth>
									<InputLabel>Quốc gia</InputLabel>
									<OutlinedInput {...field} label="Quốc gia" />
								</FormControl>
							)}
						/>
					</Stack>

					<Controller
						control={control}
						name="password"
						render={({ field }) => (
							<FormControl error={Boolean(errors.password)}>
								<InputLabel>Mật khẩu</InputLabel>
								<OutlinedInput {...field} label="Mật khẩu" type="password" autoComplete="new-password" />
								{errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>

					<Controller
						control={control}
						name="confirmPassword"
						render={({ field }) => (
							<FormControl error={Boolean(errors.confirmPassword)}>
								<InputLabel>Nhập lại mật khẩu</InputLabel>
								<OutlinedInput {...field} label="Nhập lại mật khẩu" type="password" autoComplete="new-password" />
								{errors.confirmPassword ? <FormHelperText>{errors.confirmPassword.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>

					<Controller
						control={control}
						name="terms"
						render={({ field }) => (
							<div>
								<FormControlLabel
									control={<Checkbox checked={field.value} onChange={field.onChange} />}
									label={
										<>
											Tôi đã đọc và chấp nhận <Link href="#">điều khoản sử dụng</Link>
										</>
									}
								/>
								{errors.terms ? <FormHelperText error>{errors.terms.message}</FormHelperText> : null}
							</div>
						)}
					/>

					{errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}

					<Button disabled={isPending} type="submit" variant="contained">
						{isPending ? "Đang xử lý…" : "Đăng ký"}
					</Button>
				</Stack>
			</form>

			<Alert color="warning">Lưu ý: Tài khoản tạo chỉ mang tính minh hoạ, không được lưu vĩnh viễn.</Alert>
		</Stack>
	);
}
