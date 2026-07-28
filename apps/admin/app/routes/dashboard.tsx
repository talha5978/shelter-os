import { useLoaderData, Link, type LoaderFunctionArgs } from "react-router";
import {
	Activity,
	AlertCircle,
	CalendarClock,
	Clock,
	Heart,
	Home,
	PawPrint,
	Stethoscope,
	Users,
	ChevronRight,
	Search,
} from "lucide-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { createApiClient } from "~/api/client";
import { createAnalyticsApi } from "~/api/analytics.api";
import useAuth from "~/hooks/useAuth";

// Loader to fetch data before rendering
export async function loader({ request }: LoaderFunctionArgs) {
	const cookieHeader = request.headers.get("Cookie") ?? "";
	const client = createApiClient();
	client.setCookie(cookieHeader);

	const analyticsApi = createAnalyticsApi(client);

	const data = await analyticsApi.getDashboardAnalytics();
	return data;
}

// Chart Colors aligned with a professional dark/light zinc theme
const STATUS_COLORS = {
	rescued: "#71717a", // zinc-500
	intake: "#d4d4d8", // zinc-300
	medical: "#f43f5e", // rose-500
	foster: "#3b82f6", // blue-500
	adoption_ready: "#10b981", // emerald-500
	adopted: "#18181b", // zinc-900 (or zinc-50 in dark mode handled via CSS if needed, forcing distinct hex here)
};

export default function Dashboard() {
	const loaderData = useLoaderData<typeof loader>();
	const { user } = useAuth();
	const data = loaderData.success ? loaderData.data : null;

	if (!data) {
		return null;
	}

	// Prepare pie chart data
	const pieData = Object.entries(data.animalsByStatus)
		.filter(([_, value]) => value > 0)
		.map(([name, value]) => ({ name, value }));

	return (
		<div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
						Welcome back, {user?.name}!
					</h1>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						Real-time metrics and system alerts for ShelterOS.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Badge
						variant="outline"
						className="rounded-none border-zinc-200 dark:border-zinc-800 text-xs py-1"
					>
						Avg Adoption Time:{" "}
						{data.quickStats.avgDaysToAdoption
							? `${data.quickStats.avgDaysToAdoption} Days`
							: "N/A"}
					</Badge>
					<Badge
						variant="outline"
						className="rounded-none border-zinc-200 dark:border-zinc-800 text-xs py-1"
					>
						Active Fosters: {data.quickStats.activeFosters}
					</Badge>
					<Badge
						variant="outline"
						className="rounded-none border-zinc-200 dark:border-zinc-800 text-xs py-1"
					>
						Total Adopters: {data.quickStats.totalAdopters}
					</Badge>
				</div>
			</div>

			{/* Top Metrics Row */}
			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
				<MetricCard
					title="Animals in Shelter"
					value={data.metrics.animalsInShelter}
					icon={<PawPrint className="w-4 h-4" />}
				/>
				<MetricCard
					title="Ready for Adoption"
					value={data.metrics.readyForAdoption}
					icon={<Heart className="w-4 h-4" />}
				/>
				<MetricCard
					title="Pending Fosters"
					value={data.metrics.pendingFosterRequests}
					icon={<Home className="w-4 h-4" />}
				/>
				<MetricCard
					title="Adoptions (Month)"
					value={data.metrics.adoptionsThisMonth}
					icon={<Users className="w-4 h-4" />}
				/>
				<MetricCard
					title="Overdue Checkups"
					value={data.metrics.overdueCheckups}
					icon={<AlertCircle className="w-4 h-4 text-rose-500" />}
					alert={data.metrics.overdueCheckups > 0}
				/>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Line/Area Chart: Status Over Time */}
				<Card className="lg:col-span-2 rounded-none border-zinc-200 dark:border-zinc-800 shadow-none">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Activity Trends (Last 14 Days)</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-75 w-full mt-4">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={data.statusOverTime}
									margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
								>
									<defs>
										<linearGradient id="colorAdopted" x1="0" y1="0" x2="0" y2="1">
											<stop
												offset="5%"
												stopColor={STATUS_COLORS.adopted}
												stopOpacity={0.3}
											/>
											<stop
												offset="95%"
												stopColor={STATUS_COLORS.adopted}
												stopOpacity={0}
											/>
										</linearGradient>
										<linearGradient id="colorReady" x1="0" y1="0" x2="0" y2="1">
											<stop
												offset="5%"
												stopColor={STATUS_COLORS.adoption_ready}
												stopOpacity={0.3}
											/>
											<stop
												offset="95%"
												stopColor={STATUS_COLORS.adoption_ready}
												stopOpacity={0}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										stroke="#3f3f46"
										opacity={0.2}
									/>
									<XAxis
										dataKey="date"
										tickFormatter={(val) =>
											new Date(val).toLocaleDateString(undefined, {
												month: "short",
												day: "numeric",
											})
										}
										style={{ fontSize: "12px", fill: "#71717a" }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis
										style={{ fontSize: "12px", fill: "#71717a" }}
										axisLine={false}
										tickLine={false}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: "#18181b",
											borderColor: "#27272a",
											borderRadius: "0",
											fontSize: "12px",
											color: "#fff",
										}}
										itemStyle={{ color: "#e4e4e7" }}
										labelFormatter={(val) =>
											val
												? new Date(val as number | string).toLocaleDateString(
														undefined,
														{
															weekday: "long",
															month: "short",
															day: "numeric",
														},
													)
												: "Date"
										}
									/>
									<Area
										type="monotone"
										dataKey="adopted"
										stroke={STATUS_COLORS.adopted}
										fillOpacity={1}
										fill="url(#colorAdopted)"
									/>
									<Area
										type="monotone"
										dataKey="adoption_ready"
										stroke={STATUS_COLORS.adoption_ready}
										fillOpacity={1}
										fill="url(#colorReady)"
									/>
									<Area
										type="monotone"
										dataKey="intake"
										stroke={STATUS_COLORS.intake}
										fillOpacity={0}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* Pie Chart: Current Status Breakdown */}
				<Card className="rounded-none border-zinc-200 dark:border-zinc-800 shadow-none flex flex-col">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">System Distribution</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 flex flex-col items-center justify-center">
						<div className="h-55 w-full">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={pieData}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={80}
										paddingAngle={2}
										dataKey="value"
										stroke="none"
									>
										{pieData.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={
													STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] ||
													"#71717a"
												}
											/>
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											backgroundColor: "#18181b",
											borderColor: "#27272a",
											borderRadius: "0",
											fontSize: "12px",
											color: "#fff",
										}}
										itemStyle={{ color: "#e4e4e7" }}
										formatter={(value, name) => [
											value,
											name?.toString().replace("_", " ").toUpperCase(),
										]}
									/>
								</PieChart>
							</ResponsiveContainer>
						</div>
						{/* Custom Legend */}
						<div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
							{pieData.map((entry) => (
								<div
									key={entry.name}
									className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
								>
									<div
										className="w-2.5 h-2.5 rounded-sm"
										style={{
											backgroundColor:
												STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS],
										}}
									/>
									<span>{entry.name.replace("_", " ")}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Bottom Row: Actionable Items & Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Needs Attention Tabs */}
				<Card className="rounded-none border-zinc-200 dark:border-zinc-800 shadow-none flex flex-col h-105">
					<CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-900">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<AlertCircle className="w-4 h-4 text-rose-500" />
							Needs Attention
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0 flex-1 overflow-hidden">
						<Tabs defaultValue="medical" className="w-full h-full flex flex-col">
							<div className="px-4 pt-3 border-b border-zinc-100 dark:border-zinc-900">
								<TabsList className="w-full bg-transparent p-0 justify-start h-auto gap-4 rounded-none">
									<TabsTrigger
										value="medical"
										className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-zinc-900 dark:border-zinc-100 rounded-none px-0 pb-2 text-xs uppercase tracking-wider"
									>
										Overdue Checkups ({data.needsAttention.overdueMedical.length})
									</TabsTrigger>
									<TabsTrigger
										value="fosters"
										className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-zinc-900 dark:border-zinc-100 rounded-none px-0 pb-2 text-xs uppercase tracking-wider"
									>
										Stale Fosters ({data.needsAttention.staleFosterApplications.length})
									</TabsTrigger>
									<TabsTrigger
										value="stuck"
										className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-zinc-900 dark:border-zinc-100 rounded-none px-0 pb-2 text-xs uppercase tracking-wider"
									>
										Stuck in Medical ({data.needsAttention.stuckInMedical.length})
									</TabsTrigger>
								</TabsList>
							</div>

							<div className="flex-1 overflow-y-auto p-4 space-y-1">
								<TabsContent value="medical" className="m-0 space-y-2">
									{data.needsAttention.overdueMedical.length === 0 ? (
										<EmptyState message="No overdue medical checkups." />
									) : (
										data.needsAttention.overdueMedical.map((animal) => (
											<AttentionRow
												key={animal.animalId}
												icon={<Stethoscope className="w-4 h-4 text-zinc-400" />}
												title={`${animal.animalName || "Unknown"} (${animal.animalCode})`}
												subtitle={`Due: ${animal.nextCheckup ? new Date(animal.nextCheckup).toLocaleDateString() : "N/A"}`}
												link={`/animals/${animal.animalId}`}
											/>
										))
									)}
								</TabsContent>
								<TabsContent value="fosters" className="m-0 space-y-2">
									{data.needsAttention.staleFosterApplications.length === 0 ? (
										<EmptyState message="No pending fosters older than 3 days." />
									) : (
										data.needsAttention.staleFosterApplications.map((app) => (
											<AttentionRow
												key={app.id}
												icon={<Clock className="w-4 h-4 text-zinc-400" />}
												title={`${app.userName || "Unknown Applicant"} → ${app.animalName || "Unknown"}`}
												subtitle={`Applied: ${new Date(app.createdAt).toLocaleDateString()}`}
												link={`/fosters/${app.id}`}
											/>
										))
									)}
								</TabsContent>
								<TabsContent value="stuck" className="m-0 space-y-2">
									{data.needsAttention.stuckInMedical.length === 0 ? (
										<EmptyState message="No animals stuck in medical." />
									) : (
										data.needsAttention.stuckInMedical.map((animal) => (
											<AttentionRow
												key={animal.id}
												icon={<Activity className="w-4 h-4 text-zinc-400" />}
												title={`${animal.name || "Unknown"} (${animal.animalId})`}
												subtitle={`Last Updated: ${new Date(animal.updatedAt).toLocaleDateString()}`}
												link={`/animals/${animal.id}`}
											/>
										))
									)}
								</TabsContent>
							</div>
						</Tabs>
					</CardContent>
				</Card>

				{/* Recent Activity Feed */}
				<Card className="rounded-none border-zinc-200 dark:border-zinc-800 shadow-none h-105 flex flex-col">
					<CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-900">
						<CardTitle className="text-sm font-medium flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Activity className="w-4 h-4 text-zinc-500" />
								System Activity
							</span>
							<span className="text-xs font-normal text-zinc-500">Last 8 Events</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0 overflow-y-auto flex-1">
						{data.recentActivity.length === 0 ? (
							<EmptyState message="No recent activity found." />
						) : (
							<div className="divide-y divide-zinc-100 dark:divide-zinc-900/50">
								{data.recentActivity.map((event) => (
									<div
										key={event.id}
										className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors flex gap-4"
									>
										<div className="mt-0.5">
											<div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 mt-1.5" />
										</div>
										<div className="flex-1 space-y-1">
											<div className="flex items-start justify-between gap-2">
												<p className="text-sm text-zinc-900 dark:text-zinc-100">
													{event.description}
												</p>
												<span className="text-xs text-zinc-400 whitespace-nowrap flex items-center gap-1">
													<CalendarClock className="w-3 h-3" />
													{new Date(event.eventDate).toLocaleDateString(undefined, {
														month: "short",
														day: "numeric",
													})}
												</span>
											</div>
											{event.animalName && (
												<div className="text-xs text-zinc-500 font-mono">
													Ref: {event.animalName} ({event.animalCode})
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// --- Helper Sub-Components for cleaner code ---

function MetricCard({
	title,
	value,
	icon,
	alert = false,
}: {
	title: string;
	value: number;
	icon: React.ReactNode;
	alert?: boolean;
}) {
	return (
		<Card
			className={`rounded-none border ${alert ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10" : "border-zinc-200 dark:border-zinc-800"} shadow-none`}
		>
			<CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
				<CardTitle className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
					{title}
				</CardTitle>
				<div className="text-zinc-400 dark:text-zinc-500">{icon}</div>
			</CardHeader>
			<CardContent className="px-4 pb-4">
				<div
					className={`text-2xl font-semibold tracking-tight ${alert ? "text-rose-600 dark:text-rose-500" : "text-zinc-900 dark:text-zinc-50"}`}
				>
					{value.toLocaleString()}
				</div>
			</CardContent>
		</Card>
	);
}

function AttentionRow({
	icon,
	title,
	subtitle,
	link,
}: {
	icon: React.ReactNode;
	title: string;
	subtitle: string;
	link: string;
}) {
	return (
		<Link
			to={link}
			className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group cursor-pointer"
		>
			<div className="flex items-center gap-3 overflow-hidden">
				<div className="shrink-0 p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
					{icon}
				</div>
				<div className="truncate">
					<p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{title}</p>
					<p className="text-xs text-zinc-500 truncate">{subtitle}</p>
				</div>
			</div>
			<ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 shrink-0 transition-colors" />
		</Link>
	);
}

function EmptyState({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full">
			<Search className="w-8 h-8 text-zinc-200 dark:text-zinc-800 mb-3" />
			<p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
		</div>
	);
}
