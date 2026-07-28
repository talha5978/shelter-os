import { Navigate, Outlet } from "react-router";
import SidebarLayout from "~/components/Nav/nav-layout";
import useAuth from "~/hooks/useAuth";

export default function ProtectedLayout() {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to="/sign-in" replace />;
	}

	return (
		<SidebarLayout>
			<Outlet />
		</SidebarLayout>
	);
}
