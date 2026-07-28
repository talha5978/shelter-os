import { Form, Link, type LoaderFunctionArgs, useLoaderData, useLocation, useNavigation } from "react-router";
import { Search, AlertTriangle, RefreshCw, Home } from "lucide-react";
import { createApiClient } from "~/api/client";
import { createAnimalsApi } from "~/api/animals.api"; // or createFostersApi
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { GetPaginationControls } from "~/utils/PaginationControls";
import { getPaginationQueryPayload } from "~/utils/PaginationQueryPayload";
import { FosterRequestCard } from "~/components/Animals/FosterRequestCard";
import { invalidateCache } from "~/utils/invalidate";

export const meta = () => {
	return [
		{ title: "Foster Requests | ShelterOS" },
		{ name: "description", content: "Review and manage foster applications." },
	];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const cookieHeader = request.headers.get("Cookie") ?? "";
	const client = createApiClient();
	client.setCookie(cookieHeader);

	const { q, pageIndex, pageSize } = getPaginationQueryPayload({
		request,
		defaultPageSize: 12,
	});

	const animalsApi = createAnimalsApi(client);

	const data = await animalsApi.getFosterRequests({
		search: q,
		pageIndex,
		pageSize,
	});

	return { ...data, queryParams: { q, pageIndex, pageSize } };
};

export default function FosterRequestsPage() {
	const loaderData = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const location = useLocation();

	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const fostersData = loaderData.success ? loaderData.data : null;
	const fosters = fostersData?.fosters ?? [];
	const pagination = fostersData?.pagination;
	const currentQuery = loaderData.queryParams?.q ?? "";

	const { onPageChange, onPageSizeChange } = GetPaginationControls({});

	if (!loaderData.success) {
		const error = loaderData.error;
		return (
			<div className="flex h-[70vh] items-center justify-center p-6">
				<div className="max-w-md w-full text-center">
					<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="h-10 w-10 text-destructive" />
					</div>
					<h2 className="text-2xl font-semibold tracking-tight mb-2">
						Failed to load foster requests
					</h2>
					<p className="text-muted-foreground mb-6">
						{error?.message || "Something went wrong while retrieving foster requests."}
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button onClick={() => invalidateCache("all_fosters")} variant="default">
							<RefreshCw className="mr-2 h-4 w-4" />
							Retry
						</Button>
						<Button variant="outline" asChild>
							<Link to="/">Go to Dashboard</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Foster Requests</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Review applications from foster volunteers and manage placements.
					</p>
				</div>
			</div>

			{/* Search + Count */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
				<Form method="get" className="w-full sm:max-w-md">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
						<Input
							placeholder="Search by foster name, email, animal..."
							name="q"
							defaultValue={currentQuery}
							className="pl-9 w-full bg-background"
						/>
					</div>
				</Form>

				<div className="text-xs text-muted-foreground self-end sm:self-center">
					Showing <span className="font-semibold text-foreground">{fosters.length}</span> of{" "}
					<span className="font-semibold text-foreground">{pagination?.total ?? 0}</span> requests
				</div>
			</div>

			{/* Grid */}
			{isFetching ? (
				<FostersGridSkeleton />
			) : fosters.length === 0 ? (
				<EmptyFostersState query={currentQuery} />
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{fosters.map((foster) => (
						<FosterRequestCard key={foster.id} foster={foster} />
					))}
				</div>
			)}

			{/* Pagination */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border/50">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span>Rows per page:</span>
					<Select
						value={String(pagination?.pageSize || 12)}
						onValueChange={(val) => onPageSizeChange(Number(val))}
					>
						<SelectTrigger className="h-8 w-18">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="8">8</SelectItem>
							<SelectItem value="12">12</SelectItem>
							<SelectItem value="24">24</SelectItem>
							<SelectItem value="48">48</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={!pagination?.hasPrev}
						onClick={() => onPageChange((pagination?.page || 1) - 2)}
					>
						Previous
					</Button>
					<span className="text-sm font-medium px-2">
						Page {pagination?.page || 1} of {pagination?.totalPages || 1}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={!pagination?.hasNext}
						onClick={() => onPageChange(pagination?.page || 1)}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}

function FostersGridSkeleton() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{Array.from({ length: 8 }).map((_, i) => (
				<Card key={i} className="overflow-hidden border-border/60 pt-0">
					<Skeleton className="aspect-4/3 w-full" />
					<div className="p-4 space-y-3">
						<Skeleton className="h-5 w-28" />
						<Skeleton className="h-3 w-36" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-8 w-full" />
					</div>
				</Card>
			))}
		</div>
	);
}

function EmptyFostersState({ query }: { query?: string }) {
	return (
		<div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-2xl border border-dashed border-border/80 my-4">
			<div className="p-4 rounded-full bg-muted/50 mb-4">
				<Home className="w-10 h-10 text-muted-foreground/60" />
			</div>
			<h3 className="text-lg font-semibold tracking-tight text-foreground">No foster requests found</h3>
			<p className="text-sm text-muted-foreground mt-1 max-w-sm">
				{query
					? `No records matched "${query}". Try adjusting your search term.`
					: "There are currently no foster applications in the system."}
			</p>
			{query && (
				<Button variant="outline" size="sm" className="mt-4" asChild>
					<Link to="/fosters">Clear Search Filter</Link>
				</Button>
			)}
		</div>
	);
}
