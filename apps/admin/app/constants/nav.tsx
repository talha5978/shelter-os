import { LayoutDashboard, PlusCircle, PawPrint, Users, Home, Award, BarChart3, Calendar } from "lucide-react";
import type { NavItem } from "~/types/nav";

export const navLinks: NavItem[] = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: <LayoutDashboard size={18} />,
	},
	{
		title: "Animals",
		url: "/animals",
		icon: <PawPrint size={18} />,
	},
	{
		title: "Medical Records",
		url: "/medical",
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
		title: "Timeline & History",
		url: "/timeline",
		icon: <Calendar size={18} />,
	},
	{
		title: "Analytics",
		url: "/analytics",
		icon: <BarChart3 size={18} />,
	},
	{
		title: "Users & Volunteers",
		url: "/users",
		icon: <Users size={18} />,
	},
];
