import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { Barbell } from "@phosphor-icons/react/dist/ssr/Barbell";
import { ChartPieIcon } from "@phosphor-icons/react/dist/ssr/ChartPie";
import { GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { HeartbeatIcon } from "@phosphor-icons/react/dist/ssr/Heartbeat";
import { MedalIcon } from "@phosphor-icons/react/dist/ssr/Medal";
import { PlugsConnectedIcon } from "@phosphor-icons/react/dist/ssr/PlugsConnected";
import { SignOut } from "@phosphor-icons/react/dist/ssr/SignOut"; // 👈 thêm icon logout (SSR)
import { UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { XSquare } from "@phosphor-icons/react/dist/ssr/XSquare";

export const navIcons = {
	"chart-pie": ChartPieIcon,
	"gear-six": GearSixIcon,
	"plugs-connected": PlugsConnectedIcon,
	"x-square": XSquare,
	user: UserIcon,
	users: UsersIcon,
	heartbeat: HeartbeatIcon,
	dumbbell: Barbell,
	medal: MedalIcon,
	logout: SignOut,
} as Record<string, Icon>;
