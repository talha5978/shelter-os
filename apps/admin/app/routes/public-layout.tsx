import { Navigate, Outlet } from "react-router";
import useAuth from "~/hooks/useAuth";

export default function PublicLayout() {
	const { isAuthenticated } = useAuth();

	if (isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}
