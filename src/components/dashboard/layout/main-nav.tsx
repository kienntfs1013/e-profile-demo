"use client";

import * as React from "react";
import {
	buildImageUrl,
	fetchAthleteByUserId,
	fetchUserByIdFromList,
	getLoggedInUserId,
	type AthleteDTO,
} from "@/services/user.service";
import { Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List";

import { usePopover } from "@/hooks/use-popover";

import { MobileNav } from "./mobile-nav";
import { UserPopover } from "./user-popover";

export function MainNav(): React.JSX.Element {
	const [openNav, setOpenNav] = React.useState<boolean>(false);
	const userPopover = usePopover<HTMLDivElement>();

	const [displayName, setDisplayName] = React.useState<string>("Người dùng");
	const [avatarSrc, setAvatarSrc] = React.useState<string | undefined>("/assets/avatar.png");

	React.useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const uid = getLoggedInUserId();
				if (!uid) return;

				const [user, athlete] = await Promise.all([
					fetchUserByIdFromList(uid),
					fetchAthleteByUserId(uid).catch(() => null),
				]);
				if (!user) return;

				const first = user.firstName || (athlete as AthleteDTO | null)?.first_name || "";
				const last = user.lastName || (athlete as AthleteDTO | null)?.last_name || "";
				const nameFromEmail = user.email ? user.email.split("@")[0] : "";

				const fullName = [last, first].filter(Boolean).join(" ") || (nameFromEmail ? nameFromEmail : "Người dùng");

				const avatar =
					buildImageUrl(user.profile_picture_path) ||
					buildImageUrl(athlete?.athlete_profile_picture_path) ||
					"/assets/noimagefound.png";

				if (!cancelled) {
					setDisplayName(fullName);
					setAvatarSrc(avatar);
				}
			} catch {}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<>
			<Box
				component="header"
				sx={{
					borderBottom: "1px solid var(--mui-palette-divider)",
					backgroundColor: "var(--mui-palette-background-paper)",
					position: "sticky",
					top: 0,
					zIndex: "var(--mui-zIndex-appBar)",
				}}
			>
				<Stack
					direction="row"
					spacing={2}
					sx={{ alignItems: "center", justifyContent: "space-between", minHeight: "64px", px: 2 }}
				>
					<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
						<IconButton onClick={() => setOpenNav(true)} sx={{ display: { lg: "none" } }}>
							<ListIcon />
						</IconButton>
					</Stack>

					<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
						<Typography sx={{ letterSpacing: 1, fontSize: "0.875rem" }}>{displayName}</Typography>
						<Avatar ref={userPopover.anchorRef} src={avatarSrc} alt={displayName} sx={{ cursor: "pointer" }} />
					</Stack>
				</Stack>
			</Box>

			<UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />

			<MobileNav onClose={() => setOpenNav(false)} open={openNav} />
		</>
	);
}
