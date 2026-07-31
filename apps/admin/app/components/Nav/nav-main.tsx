import { NavLink, useLocation, useResolvedPath } from "react-router";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "~/components/ui/sidebar";
import { navLinks } from "~/constants/nav";
import useAuth from "~/hooks/useAuth";

export function NavMain() {
	const location = useLocation();
	const { user } = useAuth();
	const userRole = user?.role ?? "shelter_staff";

	const visibleLinks = navLinks.filter((item) => {
		if (!item.allowedRoles) return true;
		return item.allowedRoles.includes(userRole);
	});

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu className="flex flex-col gap-2">
					{visibleLinks.map((item) => {
						const resolved = useResolvedPath(item.url).pathname;
						let isActive = location.pathname === resolved;

						return (
							<SidebarMenuItem key={item.title}>
								<NavLink to={item.url} prefetch="intent" viewTransition>
									<SidebarMenuButton
										tooltip={item.title}
										className={`cursor-pointer ${isActive ? "bg-sidebar-accent" : ""}`}
									>
										{item.icon && <>{item.icon}</>}
										<span className="my-auto">{item.title}</span>
									</SidebarMenuButton>
								</NavLink>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
