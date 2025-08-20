import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { Barbell } from "@phosphor-icons/react/dist/ssr/Barbell";
import { Briefcase } from "@phosphor-icons/react/dist/ssr/Briefcase";
import { ChartPieIcon } from "@phosphor-icons/react/dist/ssr/ChartPie";
import { GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { HeartbeatIcon } from "@phosphor-icons/react/dist/ssr/Heartbeat";
import { Info } from "@phosphor-icons/react/dist/ssr/Info";
import { MedalIcon } from "@phosphor-icons/react/dist/ssr/Medal";
import { PlugsConnectedIcon } from "@phosphor-icons/react/dist/ssr/PlugsConnected";
import { SignOut } from "@phosphor-icons/react/dist/ssr/SignOut";
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
	info: Info,
	briefcase: Briefcase,
} as Record<string, Icon>;
