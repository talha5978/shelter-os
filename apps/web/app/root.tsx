import {
	data,
	isRouteErrorResponse,
	Links,
	Meta,
	Link,
	Outlet,
	Scripts,
	ScrollRestoration,
	useNavigate,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { createApiClient } from "~/api/client";
import { createAuthApi } from "~/api/auth.api";
import { Toaster } from "~/components/ui/sonner";
import { TopLoadingBar } from "~/components/Loaders/TopLoadingBar";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "~/lib/tanstackQueryClient";
import { useState } from "react";
import {
	AlertTriangle,
	FileQuestion,
	ArrowLeft,
	Home,
	RefreshCw,
	Copy,
	Check,
	Bug,
	ChevronDown,
	ChevronUp,
} from "lucide-react";

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
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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
	const navigate = useNavigate();
	const [copied, setCopied] = useState(false);
	const [showStack, setShowStack] = useState(false);

	let is404 = false;
	let statusCode = "500";
	let message = "Something went wrong";
	let details = "An unexpected error occurred. Please try again or return home.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		is404 = error.status === 404;
		statusCode = String(error.status);
		message = is404 ? "Page Not Found" : `Error ${error.status}`;
		details = is404
			? "Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed."
			: error.statusText || details;
	} else if (process.env.VITE_ENV === "development" && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	const handleCopyStack = () => {
		if (!stack) return;
		navigator.clipboard.writeText(stack);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<main className="min-h-[80vh] w-full flex items-center justify-center p-4">
			<div className="w-full max-w-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8">
				{/* Header Section */}
				<div className="flex flex-col items-start gap-4">
					<div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1">
						{is404 ? (
							<FileQuestion className="w-3.5 h-3.5" />
						) : (
							<AlertTriangle className="w-3.5 h-3.5" />
						)}
						<span>STATUS {statusCode}</span>
					</div>

					<div>
						<h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
							{message}
						</h1>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
							{details}
						</p>
					</div>
				</div>

				{/* Action Controls */}
				<div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap items-center gap-2">
					<button
						onClick={() => navigate(-1)}
						className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors"
					>
						<ArrowLeft className="w-3.5 h-3.5" />
						Go Back
					</button>

					<button
						onClick={() => window.location.reload()}
						className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors"
					>
						<RefreshCw className="w-3.5 h-3.5" />
						Reload
					</button>

					<Link
						to="/"
						className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
					>
						<Home className="w-3.5 h-3.5" />
						Home
					</Link>
				</div>

				{/* Developer Stack Trace Section */}
				{stack && (
					<div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
						<div className="flex items-center justify-between mb-2">
							<button
								onClick={() => setShowStack((prev) => !prev)}
								className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
							>
								<Bug className="w-3.5 h-3.5" />
								<span>Stack Trace</span>
								{showStack ? (
									<ChevronUp className="w-3.5 h-3.5" />
								) : (
									<ChevronDown className="w-3.5 h-3.5" />
								)}
							</button>

							{showStack && (
								<button
									onClick={handleCopyStack}
									className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
								>
									{copied ? (
										<>
											<Check className="w-3 h-3 text-emerald-500" />
											<span className="text-emerald-500">Copied</span>
										</>
									) : (
										<>
											<Copy className="w-3 h-3" />
											<span>Copy</span>
										</>
									)}
								</button>
							)}
						</div>

						{showStack && (
							<div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3">
								<pre className="text-[11px] font-mono leading-relaxed overflow-x-auto max-h-48 text-zinc-700 dark:text-zinc-300">
									<code>{stack}</code>
								</pre>
							</div>
						)}
					</div>
				)}
			</div>
		</main>
	);
}
