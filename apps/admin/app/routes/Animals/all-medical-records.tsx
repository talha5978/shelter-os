import { useState, useEffect, useMemo } from "react";
import {
	useSearchParams,
	type LoaderFunctionArgs,
	useLoaderData,
	useNavigation,
	useLocation,
} from "react-router";
import {
	Activity,
	AlertTriangle,
	CalendarClock,
	Search,
	ChevronLeft,
	ChevronRight,
	HeartPulse,
	Loader2,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AnimalMedicalCard } from "~/components/MedicalRecords/AnimalMedicalCard";
import { createApiClient } from "~/api/client";
import { getPaginationQueryPayload } from "~/utils/PaginationQueryPayload";
import { createAnimalsApi } from "~/api/animals.api";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const cookieHeader = request.headers.get("Cookie") ?? "";
	const client = createApiClient();
	client.setCookie(cookieHeader);

	const { q, pageIndex, pageSize } = getPaginationQueryPayload({ request, defaultPageSize: 12 });

	const animalsApi = createAnimalsApi(client);

	const data = await animalsApi.getMedicalRecords({
		search: q,
		pageIndex,
		pageSize,
	});

	return { ...data, queryParams: { q, pageIndex, pageSize } };
};

export const meta = () => {
	return [
		{
			title: "Medical Records | ShelterOS",
		},
	];
};

export default function MedicalRecordsIndex() {
	const [searchParams, setSearchParams] = useSearchParams();
	const loaderData = useLoaderData<typeof loader>();

	const searchParam = searchParams.get("q") || "";
	const medicalData = loaderData.success ? loaderData.data : null;

	const navigation = useNavigation();
	const location = useLocation();
	const isLoading = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const [searchTerm, setSearchTerm] = useState(searchParam);

	useEffect(() => {
		setSearchTerm(searchParam);
	}, [searchParam]);

	// Group by animalId and merge multiple medical records for the same animal
	const uniqueAnimals = useMemo(() => {
		if (!medicalData?.animals) return [];

		const animalMap = new Map();

		medicalData.animals.forEach((record) => {
			if (!animalMap.has(record.animalId)) {
				// First time seeing this animal, clone it into the map
				animalMap.set(record.animalId, {
					...record,
					activeConditions: [...record.activeConditions],
				});
			} else {
				// We have another record for this animal, merge the data!
				const existing = animalMap.get(record.animalId);

				// 1. Merge conditions without duplicates
				const combinedConditions = Array.from(
					new Set([...existing.activeConditions, ...record.activeConditions]),
				);
				existing.activeConditions = combinedConditions;
				existing.conditionsCount = combinedConditions.length;

				// 2. Prioritize the most urgent checkup status
				if (record.checkupStatus === "overdue") {
					existing.checkupStatus = "overdue";
				} else if (record.checkupStatus === "upcoming" && existing.checkupStatus === "none") {
					existing.checkupStatus = "upcoming";
				}

				// 3. Keep the most urgent nextCheckup date
				if (record.nextCheckup) {
					if (
						!existing.nextCheckup ||
						new Date(record.nextCheckup) < new Date(existing.nextCheckup)
					) {
						existing.nextCheckup = record.nextCheckup;
					}
				}
			}
		});

		return Array.from(animalMap.values());
	}, [medicalData?.animals]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const newParams = new URLSearchParams(searchParams);
		if (searchTerm) {
			newParams.set("q", searchTerm);
		} else {
			newParams.delete("q");
		}
		newParams.set("pageIndex", "1");
		setSearchParams(newParams);
	};

	const handlePageChange = (newPage: number) => {
		const newParams = new URLSearchParams(searchParams);
		newParams.set("pageIndex", String(newPage));
		setSearchParams(newParams);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="container max-w-7xl py-8 space-y-8 animate-in fade-in duration-500">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
						<HeartPulse className="w-8 h-8 text-primary" />
						Medical Center
					</h1>
					<p className="text-muted-foreground mt-1">
						Track checkups, manage health conditions, and oversee shelter medical care.
					</p>
				</div>
			</div>

			{/* Stats Dashboard */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="bg-background shadow-sm border-border/60">
					<CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Medical Records
						</CardTitle>
						<Activity className="w-4 h-4 text-emerald-500" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{medicalData?.stats.total || 0}</div>
						<p className="text-xs text-muted-foreground mt-1">Across all animals</p>
					</CardContent>
				</Card>

				<Card className="bg-rose-50/40 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 shadow-sm">
					<CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
						<CardTitle className="text-sm font-medium text-rose-800 dark:text-rose-400">
							Overdue Checkups
						</CardTitle>
						<AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-500" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-rose-950 dark:text-rose-100">
							{medicalData?.stats.overdue || 0}
						</div>
					</CardContent>
				</Card>

				<Card className="bg-sky-50/40 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/50 shadow-sm">
					<CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
						<CardTitle className="text-sm font-medium text-sky-800 dark:text-sky-400">
							Upcoming Appointments
						</CardTitle>
						<CalendarClock className="w-4 h-4 text-sky-600 dark:text-sky-500" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-sky-950 dark:text-sky-100">
							{medicalData?.stats.upcoming || 0}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Toolbar (Search & Filters) */}
			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-lg border border-border/40">
				<form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search by name, ID, or species..."
						className="pl-9 bg-background"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</form>

				<div className="text-sm text-muted-foreground font-medium w-full sm:w-auto text-right">
					{medicalData && <span>Showing {uniqueAnimals.length} animals</span>}
				</div>
			</div>

			{/* Grid Layout */}
			<div className="min-h-100">
				{isLoading ? (
					<div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground py-20">
						<Loader2 className="w-10 h-10 animate-spin" />
						<p>Loading medical records...</p>
					</div>
				) : !medicalData ? (
					<div className="w-full py-20 text-center space-y-4">
						<AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
						<h3 className="text-lg font-semibold">Failed to load records</h3>
						<p className="text-muted-foreground">
							There was a problem fetching the medical data.
						</p>
						<Button onClick={() => window.location.reload()} variant="outline">
							Try Again
						</Button>
					</div>
				) : uniqueAnimals.length === 0 ? (
					<div className="w-full py-20 text-center space-y-3 bg-muted/20 border border-dashed rounded-lg">
						<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
							<Search className="w-6 h-6 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold">No records found</h3>
						<p className="text-muted-foreground">
							{searchParam
								? `No animals matched the search "${searchParam}".`
								: "No medical records are currently available."}
						</p>
						{searchParam && (
							<Button
								variant="link"
								onClick={() => {
									setSearchTerm("");
									setSearchParams(new URLSearchParams());
								}}
							>
								Clear search filter
							</Button>
						)}
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{uniqueAnimals.map((animal) => (
							<AnimalMedicalCard key={animal.animalId} animal={animal as any} />
						))}
					</div>
				)}
			</div>

			{/* Pagination */}
			{!isLoading && medicalData && medicalData.pagination.totalPages > 1 && (
				<div className="flex items-center justify-center gap-4 pt-4 border-t border-border/40">
					<Button
						variant="outline"
						size="sm"
						disabled={!medicalData.pagination.hasPrev}
						onClick={() => handlePageChange(medicalData.pagination.page - 1)}
					>
						<ChevronLeft className="w-4 h-4 mr-1" />
						Previous
					</Button>

					<span className="text-sm font-medium text-muted-foreground">
						Page {medicalData.pagination.page} of {medicalData.pagination.totalPages}
					</span>

					<Button
						variant="outline"
						size="sm"
						disabled={!medicalData.pagination.hasNext}
						onClick={() => handlePageChange(medicalData.pagination.page + 1)}
					>
						Next
						<ChevronRight className="w-4 h-4 ml-1" />
					</Button>
				</div>
			)}
		</div>
	);
}
