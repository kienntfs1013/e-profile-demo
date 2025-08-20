import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";

export const navItems = [
	{
		key: "account",
		title: "Tài khoản",
		href: paths.dashboard.account,
		icon: "user",
	},
	{
		key: "executive",
		title: "Thông tin điều hành",
		href: paths.dashboard.executive,
		icon: "briefcase",
	},
	{
		key: "athletes",
		title: "Vận động viên",
		href: paths.dashboard.customers,
		icon: "users",
	},
	{
		key: "health",
		title: "Sức khỏe",
		href: paths.dashboard.health,
		icon: "heartbeat",
	},
	{
		key: "training",
		title: "Tập luyện",
		href: paths.dashboard.training,
		icon: "dumbbell",
	},
	{
		key: "achievement",
		title: "Thành tích",
		href: paths.dashboard.achievement,
		icon: "medal",
	},
	{
		key: "logout",
		title: "Đăng xuất",
		href: paths.auth.signIn,
		icon: "logout",
	},
] satisfies NavItemConfig[];
