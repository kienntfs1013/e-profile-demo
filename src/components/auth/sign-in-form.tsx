"use client";

import * as React from "react";
import RouterLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

import { paths } from "@/paths";
import { authClient } from "@/lib/auth/client";
import { useUser } from "@/hooks/use-user";

const schema = zod.object({
	email: zod.string().min(1, { message: "Email là bắt buộc" }).email("Email không hợp lệ"),
	password: zod.string().min(1, { message: "Mật khẩu là bắt buộc" }),
});
type Values = zod.infer<typeof schema>;
const defaultValues: Values = { email: "", password: "" };

export function SignInForm(): React.JSX.Element {
	const router = useRouter();
	const search = useSearchParams();
	const { checkSession } = useUser();

	const [showPassword, setShowPassword] = React.useState(false);
	const [isPending, setIsPending] = React.useState(false);
	const [openSuccess, setOpenSuccess] = React.useState(false);
	const redirectTimerRef = React.useRef<number | null>(null);

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

	const goAccount = React.useCallback(async () => {
		await checkSession?.();
		const next = search.get("next");
		const dest = next && next.startsWith("/") ? next : paths.dashboard.account;
		router.replace(dest);
	}, [checkSession, router, search]);

	const onSubmit = React.useCallback(
		async (values: Values) => {
			setIsPending(true);
			const { error, accessToken, userId } = await authClient.signInWithPassword(values);
			if (error) {
				setError("root", { type: "server", message: error });
				setIsPending(false);
				return;
			}

			const stored = typeof window !== "undefined" ? localStorage.getItem("eprofile_access_token") : null;
			console.groupCollapsed("[Auth] Login success");
			console.table({
				accessToken_preview: accessToken ? accessToken.slice(0, 24) + "..." : null,
				stored_preview: stored ? stored.slice(0, 24) + "..." : null,
				userId,
			});
			console.groupEnd();

			setOpenSuccess(true);
			setIsPending(false);
			redirectTimerRef.current = window.setTimeout(() => {
				goAccount();
			}, 800) as unknown as number;
		},
		[goAccount, setError]
	);

	React.useEffect(() => {
		return () => {
			if (redirectTimerRef.current) {
				clearTimeout(redirectTimerRef.current);
				redirectTimerRef.current = null;
			}
		};
	}, []);

	const handleGoNow = (): void => {
		if (redirectTimerRef.current) {
			clearTimeout(redirectTimerRef.current);
			redirectTimerRef.current = null;
		}
		goAccount();
	};

	return (
		<>
			<Stack spacing={4}>
				<Stack spacing={1}>
					<Typography variant="h4">Đăng nhập</Typography>
					<Typography color="text.secondary" variant="body2">
						Chưa có tài khoản{" "}
						<Link component={RouterLink} href={paths.auth.signUp} underline="hover" variant="subtitle2">
							Đăng ký
						</Link>
					</Typography>
				</Stack>

				<form onSubmit={handleSubmit(onSubmit)}>
					<Stack spacing={2}>
						<Controller
							control={control}
							name="email"
							render={({ field }) => (
								<FormControl error={Boolean(errors.email)}>
									<InputLabel>Email</InputLabel>
									<OutlinedInput {...field} label="Email" type="email" autoComplete="email" />
									{errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
								</FormControl>
							)}
						/>
						<Controller
							control={control}
							name="password"
							render={({ field }) => (
								<FormControl error={Boolean(errors.password)}>
									<InputLabel>Mật khẩu</InputLabel>
									<OutlinedInput
										{...field}
										label="Mật khẩu"
										type={showPassword ? "text" : "password"}
										autoComplete="current-password"
										endAdornment={
											showPassword ? (
												<EyeIcon
													cursor="pointer"
													fontSize="var(--icon-fontSize-md)"
													onClick={() => setShowPassword(false)}
												/>
											) : (
												<EyeSlashIcon
													cursor="pointer"
													fontSize="var(--icon-fontSize-md)"
													onClick={() => setShowPassword(true)}
												/>
											)
										}
									/>
									{errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
								</FormControl>
							)}
						/>
						{errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
						<Button disabled={isPending} type="submit" variant="contained">
							{isPending ? "Đang xử lý..." : "Đăng nhập"}
						</Button>
					</Stack>
				</form>
			</Stack>

			<Dialog open={openSuccess} onClose={handleGoNow} maxWidth="xs" fullWidth>
				<DialogTitle>Đăng nhập thành công</DialogTitle>
				<DialogContent>
					<Alert severity="success">Chào mừng bạn quay lại! Đang chuyển tới trang tài khoản…</Alert>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleGoNow} variant="contained">
						Vào ngay
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
