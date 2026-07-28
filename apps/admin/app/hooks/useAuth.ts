import { useRouteLoaderData } from "react-router";
import type { loader } from "~/root";

export default function useAuth() {
	const rootLoaderData = useRouteLoaderData<typeof loader>("root");
	return {
		isAuthenticated: rootLoaderData?.isAuthenticated ?? false,
		user: rootLoaderData?.user?.success ? rootLoaderData?.user?.data.user : null,
	};
}
