import { Navigate, Outlet } from "react-router";
import { useRouteLoaderData } from "react-router";

export default function ProtectedLayout() {
	const { isAuthenticated } = useRouteLoaderData("root") as { isAuthenticated: boolean };

	if (!isAuthenticated) {
		return <Navigate to="/sign-in" replace />;
	}

	return <Outlet />;
}
