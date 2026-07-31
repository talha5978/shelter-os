import { Navigate } from "react-router";
import { toast } from "sonner";
import type { UserRole } from "@workspace/db";
import useAuth from "~/hooks/useAuth";

type RoleGuardProps = {
	allowedRoles: UserRole[];
	children: React.ReactNode;
	redirectTo?: string;
};

export function RoleGuard({ allowedRoles, children, redirectTo = "/" }: RoleGuardProps) {
	const { user } = useAuth();

	const isAllowed = allowedRoles.includes(user?.role ?? "shelter_staff");

	if (!isAllowed) {
		toast.error("You do not have permission to access this page.");
		return <Navigate to={redirectTo} replace />;
	}

	return <>{children}</>;
}
