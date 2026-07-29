import { LayoutDashboard, PlusCircle, PawPrint, Users, Home, Award } from "lucide-react";
import type { NavItem } from "~/types/nav";

export const navLinks: NavItem[] = [
	{
		title: "Dashboard",
		url: "/",
		icon: <LayoutDashboard size={18} />,
	},
	{
		title: "Animals",
		url: "/animals",
		icon: <PawPrint size={18} />,
	},
	{
		title: "Medical Records",
		url: "/medical-records",
		icon: <PlusCircle size={18} />,
	},
	{
		title: "Foster Management",
		url: "/fosters",
		icon: <Home size={18} />,
	},
	{
		title: "Adoptions",
		url: "/adoptions",
		icon: <Award size={18} />,
	},
	{
		title: "Users & Volunteers",
		url: "/users",
		icon: <Users size={18} />,
	},
];
