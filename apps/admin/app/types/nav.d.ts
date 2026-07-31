import type { UserRole } from "@workspace/db";

export interface NavItem {
	title: string;
	url: string;
	icon: JSX.Element;
	allowedRoles?: UserRole[];
}
