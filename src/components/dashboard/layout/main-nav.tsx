"use client";

import * as React from "react";
import {
	buildImageUrl,
	fetchAthleteByUserId,
	fetchUserByIdFromList,
	getLoggedInUserId,
	listUsers,
	type AthleteDTO,
} from "@/services/user.service";
import { Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { List as ListIcon } from "@phosphor-icons/react";

import { usePopover } from "@/hooks/use-popover";

import { MobileNav } from "./mobile-nav";
import { UserPopover } from "./user-popover";

const LEGACY_DEFAULT_AVATAR_PATTERNS = [
	"pngtree-default-avatar-profile-icon",
	"default-avatar-profile-icon-gray-placeholder",
	"image-not-found.png",
];

function decodeJwtPayload(t?: string) {
	try {
		if (!t) return {};
		const p = t.split(".")[1];
		if (!p) return {};
		const json = atob(p.replace(/-/g, "+").replace(/_/g, "/"));
		return JSON.parse(json || "{}") || {};
	} catch {
		return {};
	}
}

function readLocalAuth() {
	try {
		const idCandidate =
			Number(localStorage.getItem("uid")) ||
			Number(localStorage.getItem("user_id")) ||
			Number(localStorage.getItem("userId"));
		const id = Number.isFinite(idCandidate) && idCandidate > 0 ? idCandidate : undefined;

		let email: string | undefined;
		const cu = localStorage.getItem("currentUser") || localStorage.getItem("auth_user") || localStorage.getItem("user");
		if (cu) {
			try {
				const obj = JSON.parse(cu);
				email = obj?.email || obj?.user?.email;
			} catch {}
		}
		const tok =
			localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("accessToken");
		if (!email && tok) {
			const payload = decodeJwtPayload(tok);
			email = payload?.email || payload?.upn || payload?.preferred_username || undefined;
		}
		return { id, email };
	} catch {
		return {};
	}
}

function isLegacyDefaultAvatar(value?: string | null): boolean {
	const s = String(value || "")
		.trim()
		.toLowerCase();
	if (!s) return false;
	return LEGACY_DEFAULT_AVATAR_PATTERNS.some((pattern) => s.includes(pattern));
}

function resolveAvatarSrc(value?: string | null): string | undefined {
	const raw = String(value || "").trim();
	if (!raw || isLegacyDefaultAvatar(raw)) return undefined;
	if (/^(blob:|data:|https?:\/\/)/i.test(raw)) return raw;
	const built = buildImageUrl(raw);
	if (!built || isLegacyDefaultAvatar(built)) return undefined;
	return built;
}

export function MainNav(): React.JSX.Element {
	const [openNav, setOpenNav] = React.useState<boolean>(false);
	const userPopover = usePopover<HTMLDivElement>();
	const [displayName, setDisplayName] = React.useState<string>("Người dùng");
	const [email, setEmail] = React.useState<string | undefined>(undefined);
	const [avatarSrc, setAvatarSrc] = React.useState<string | undefined>(undefined);

	React.useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				let uid = getLoggedInUserId();
				const localAuth = readLocalAuth();
				if (!uid && localAuth.id) uid = localAuth.id;

				let user: any | null = null;
				if (uid) {
					const rows = await listUsers({ id: uid }).catch(() => []);
					user = rows?.[0] ?? (await fetchUserByIdFromList(uid).catch(() => null));
				} else if (localAuth.email) {
					const rows = await listUsers({ email: localAuth.email }).catch(() => []);
					user = rows?.[0] ?? null;
					if (!uid && user?.id) uid = user.id;
				}
				if (!user) return;

				const athlete = uid ? await fetchAthleteByUserId(uid).catch(() => null) : null;

				const first = user.firstName || (athlete as AthleteDTO | null)?.first_name || "";
				const last = user.lastName || (athlete as AthleteDTO | null)?.last_name || "";
				const nameFromEmail = user.email ? String(user.email).split("@")[0] : "";
				const fullName = [last, first].filter(Boolean).join(" ") || nameFromEmail || "Người dùng";

				const avatar =
					resolveAvatarSrc(user.profile_picture_path) ||
					resolveAvatarSrc((athlete as AthleteDTO | null)?.athlete_profile_picture_path);

				if (!cancelled) {
					setDisplayName(fullName);
					setEmail(user.email || localAuth.email);
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
						<Avatar
							ref={userPopover.anchorRef}
							src={avatarSrc || undefined}
							alt={displayName}
							sx={{ cursor: "pointer" }}
							onClick={userPopover.handleOpen}
						/>
					</Stack>
				</Stack>
			</Box>

			<UserPopover
				anchorEl={userPopover.anchorRef.current}
				onClose={userPopover.handleClose}
				open={userPopover.open}
				name={displayName}
				email={email}
			/>
			<MobileNav onClose={() => setOpenNav(false)} open={openNav} />
		</>
	);
}
