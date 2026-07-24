import { data, isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { createApiClient } from "~/api/client";
import { createAuthApi } from "~/api/auth.api";
import { Toaster } from "~/components/ui/sonner";
import { TopLoadingBar } from "~/components/Loaders/TopLoadingBar";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap",
	},
];

export const loader = async ({ request }: Route.LoaderArgs) => {
	try {
		const cookieHeader = request.headers.get("Cookie") ?? "";

		const client = createApiClient();
		client.setCookie(cookieHeader);
		const authApi = createAuthApi(client);

		const user = await authApi.me();

		return data(
			{
				user,
				isAuthenticated: user.success || false,
			},
			{
				headers: {
					"Set-Cookie": authApi.client.getCookie(),
				},
			},
		);
	} catch (error) {
		console.error(error);
		return data({
			user: null,
			isAuthenticated: false,
		});
	}
};

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<>
			<Outlet />
			<Toaster />
			<TopLoadingBar />
		</>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (process.env.VITE_ENV === "development" && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1 className="text-4xl font-bold mb-4">{message}</h1>
			<p className="text-lg mb-8">{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code className="text-sm bg-gray-100 p-2 rounded">{stack}</code>
				</pre>
			)}
		</main>
	);
}
