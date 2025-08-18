"use client";

import * as React from "react";
import RouterLink from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
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

// Có thể để trống mặc định nếu muốn
const defaultValues = { email: "sofia@devias.io", password: "Secret1" } satisfies Values;

export function SignInForm(): React.JSX.Element {
	const router = useRouter();
	const { checkSession } = useUser();

	const [showPassword, setShowPassword] = React.useState<boolean>(false);
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

			const { error } = await authClient.signInWithPassword(values);
			if (error) {
				setError("root", { type: "server", message: error });
				setIsPending(false);
				return;
			}

			await checkSession?.();
			router.refresh(); // GuestGuard sẽ tự điều hướng khi đã đăng nhập
		},
		[checkSession, router, setError]
	);

	return (
		<Stack spacing={4}>
			<Stack spacing={1}>
				<Typography variant="h4">Đăng nhập</Typography>
				<Typography color="text.secondary" variant="body2">
					Chưa có tài khoản?{" "}
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
								<OutlinedInput {...field} label="Email" type="email" />
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

					<div>
						<Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
							Quên mật khẩu?
						</Link>
					</div>

					{errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}

					<Button disabled={isPending} type="submit" variant="contained">
						{isPending ? "Đang xử lý..." : "Đăng nhập"}
					</Button>
				</Stack>
			</form>

			<Alert color="warning">
				Dùng{" "}
				<Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
					sofia@devias.io
				</Typography>{" "}
				với mật khẩu{" "}
				<Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
					Secret1
				</Typography>{" "}
				để thử nhanh.
			</Alert>
		</Stack>
	);
}
