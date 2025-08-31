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
		key: "customers",
		title: "Danh sách vận động viên",
		href: paths.dashboard.customers,
		icon: "users",
	},
	{
		key: "coaches",
		title: "Danh sách huấn luyện viên",
		href: paths.dashboard.coaches,
		icon: "users",
	},
	{
		key: "athletesManagement",
		title: "Quản lý vận động viên",
		href: paths.dashboard.athletesManagement,
		icon: "users",
	},
	{
		key: "coachesManagement",
		title: "Quản lý huấn luyện viên",
		href: paths.dashboard.coachesManagement,
		icon: "users",
	},
	{
		key: "usersManagement",
		title: "Quản lý người dùng",
		href: paths.dashboard.usersManagement,
		icon: "users",
	},
	{
		key: "competitions",
		title: "Giải đấu",
		href: paths.dashboard.competitions,
		icon: "trophy",
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
