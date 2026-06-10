import * as React from "react";
import RouterLink from "next/link";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { UserIcon } from "@phosphor-icons/react/dist/ssr/User";

import { paths } from "@/paths";
import { authClient } from "@/lib/auth/client";
import { logger } from "@/lib/default-logger";
import { useUser } from "@/hooks/use-user";

export interface UserPopoverProps {
	anchorEl: Element | null;
	onClose: () => void;
	open: boolean;
	name?: string;
	email?: string;
}

export function UserPopover({ anchorEl, onClose, open, name, email }: UserPopoverProps): React.JSX.Element {
	const { checkSession } = useUser();
	const router = useRouter();

	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const [signingOut, setSigningOut] = React.useState(false);

	const handleSignOut = React.useCallback(async (): Promise<void> => {
		try {
			setSigningOut(true);
			const result = await authClient.signOut();
			const error = (result as { error?: unknown }).error;

			if (error) {
				logger.error("Sign out error", error);
				return;
			}

			await checkSession?.();
			router.replace(paths.auth.signIn);
		} catch (error) {
			logger.error("Sign out error", error);
		} finally {
			setSigningOut(false);
			setConfirmOpen(false);
			onClose();
		}
	}, [checkSession, router, onClose]);

	return (
		<>
			<Popover
				anchorEl={anchorEl}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				onClose={onClose}
				open={open}
				slotProps={{ paper: { sx: { width: "240px" } } }}
			>
				<Box sx={{ p: "16px 20px" }}>
					<Typography variant="subtitle1" noWrap>
						{name || "Người dùng"}
					</Typography>
					{email ? (
						<Typography color="text.secondary" variant="body2" noWrap>
							{email}
						</Typography>
					) : null}
				</Box>
				<Divider />
				<MenuList disablePadding sx={{ p: "8px", "& .MuiMenuItem-root": { borderRadius: 1 } }}>
					<MenuItem component={RouterLink} href={paths.dashboard.account} onClick={onClose}>
						<ListItemIcon>
							<UserIcon fontSize="var(--icon-fontSize-md)" />
						</ListItemIcon>
						Tài khoản
					</MenuItem>
					<MenuItem component={RouterLink} href={paths.dashboard.settings} onClick={onClose}>
						<ListItemIcon>
							<GearSixIcon fontSize="var(--icon-fontSize-md)" />
						</ListItemIcon>
						Cài đặt
					</MenuItem>
					<MenuItem onClick={() => setConfirmOpen(true)}>
						<ListItemIcon>
							<SignOutIcon fontSize="var(--icon-fontSize-md)" />
						</ListItemIcon>
						Đăng xuất
					</MenuItem>
				</MenuList>
			</Popover>

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="xs">
				<DialogTitle>Xác nhận đăng xuất</DialogTitle>
				<DialogContent>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined" disabled={signingOut}>
						Hủy
					</Button>
					<Button onClick={handleSignOut} variant="contained" color="primary" disabled={signingOut} autoFocus>
						{signingOut ? "Đang đăng xuất..." : "Đăng xuất"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
