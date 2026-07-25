import { type LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router";
import { createApiClient } from "~/api/client";
import { createAnimalsApi } from "~/api/animals.api";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import {
	Syringe,
	Pill,
	ShieldAlert,
	Calendar as CalendarIcon,
	FileText,
	Stethoscope,
	AlertTriangle,
	ArrowLeft,
	PawPrint,
	Clock,
	CheckCircle2,
	History,
	FolderOpen,
	Plus,
} from "lucide-react";
import AddMedicalRecordSheet from "~/components/MedicalRecords/AddMedicalRecordSheet";
import { useState } from "react";

// Types derived from your backend model
type Vaccine = {
	name: string;
	date: Date | string;
	description?: string | null;
};

type Medication = {
	name: string;
	dosage: string;
	frequency?: string;
	startDate?: Date | string;
	endDate?: Date | string | null;
};

export type MedicalRecord = {
	id: string;
	createdAt: Date | string;
	updatedAt: Date | string;
	animalId: string;
	createdBy: string;
	vaccines: unknown;
	medications: unknown;
	conditions: string[] | null;
	nextCheckup: Date | string | null;
	notes: string | null;
} & {
	vaccines?: Vaccine[];
	medications?: Medication[];
};

export const meta = () => {
	return [{ title: "Medical Record History | ShelterOS" }];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const cookieHeader = request.headers.get("Cookie") ?? "";
	const client = createApiClient();
	client.setCookie(cookieHeader);

	const animalId = params.animalId;

	if (!animalId) {
		throw new Response("Animal ID is required", { status: 400 });
	}

	const animalsApi = createAnimalsApi(client);
	const result = await animalsApi.getMedicalRecords(animalId);
	console.log(result);
	return {
		...result,
		animalIdParam: animalId,
	};
};

export default function AnimalMedicalRecordPage() {
	const loaderData = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const [medicalSheetOpen, setMedicalSheetOpen] = useState(false);

	// Helper date formatter
	const formatDate = (date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions) => {
		if (!date) return "—";
		return new Date(date).toLocaleDateString(
			"en-US",
			options || { month: "short", day: "numeric", year: "numeric" },
		);
	};

	if (!loaderData.success) {
		return (
			<div className="min-h-[80vh] flex items-center justify-center p-4">
				<Card className="max-w-md text-center p-8 border-destructive/20 shadow-lg">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
						<AlertTriangle className="h-8 w-8" />
					</div>
					<h2 className="text-xl font-bold mb-2">Failed to load medical records</h2>
					<p className="text-sm text-muted-foreground mb-6">
						{loaderData.error?.message || "Could not fetch medical history for this animal."}
					</p>
					<Button onClick={() => navigate(-1)} variant="default">
						<ArrowLeft className="w-4 h-4 mr-2" /> Go Back
					</Button>
				</Card>
			</div>
		);
	}

	// Parse array of records safely
	const rawRecords = loaderData.data?.records;
	const records: MedicalRecord[] = Array.isArray(rawRecords)
		? (rawRecords as MedicalRecord[])
		: rawRecords
			? [rawRecords as MedicalRecord]
			: [];

	// Sort records newest first
	const sortedRecords = [...records].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	// Compute aggregate metrics across all historical records
	const totalVaccinesCount = sortedRecords.reduce((acc, r) => {
		const vList = Array.isArray(r.vaccines) ? r.vaccines : [];
		return acc + vList.length;
	}, 0);

	const totalMedicationsCount = sortedRecords.reduce((acc, r) => {
		const mList = Array.isArray(r.medications) ? r.medications : [];
		return acc + mList.length;
	}, 0);

	const allConditions = Array.from(
		new Set(sortedRecords.flatMap((r) => (Array.isArray(r.conditions) ? r.conditions : []))),
	);

	// Find the next upcoming checkup from all entries
	const upcomingCheckups = sortedRecords
		.map((r) => r.nextCheckup)
		.filter((d): d is Date | string => Boolean(d))
		.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

	const nextUpcomingCheckup = upcomingCheckups[0];

	const animalName = loaderData.data?.animal?.name || "Unknown Animal";
	const animalId = loaderData.data?.animal?.id;
	const animalDisplayId = loaderData.data.animal?.animalId || loaderData.data?.animal?.id;

	return (
		<div className="min-h-screen bg-muted/10 pb-12">
			<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
				{/* TOP NAVIGATION BAR */}
				<div className="flex items-center justify-between flex-wrap gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate(-1)}
						className="gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Animal Profile
					</Button>

					{/* Quick top action button */}
					<Button size="sm" onClick={() => setMedicalSheetOpen(true)} className="shadow-sm ml-auto">
						<Plus className="w-4 h-4 mr-1.5" />
						Add Medical Record
					</Button>
				</div>

				{/* ANIMAL & HISTORICAL SUMMARY HEADER CARD */}
				<Card className="border-border/60 shadow-sm bg-card overflow-hidden py-0">
					<div className="px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-accent/30">
						<div className="flex items-center gap-4">
							<div className="h-16 w-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
								<PawPrint className="h-8 w-8 text-primary" />
							</div>
							<div>
								<div className="flex items-center gap-2.5 flex-wrap">
									{/* Animal Name in Header */}
									<h1 className="text-2xl font-bold tracking-tight">
										{animalName}'s Medical Records
									</h1>

									{/* Animal ID Badge */}
									{animalDisplayId && (
										<Badge
											variant="secondary"
											className="font-mono text-xs px-2 py-0.5 border border-border/60 bg-background/80"
										>
											{animalDisplayId}
										</Badge>
									)}
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									Chronological timeline of veterinary checkups, immunizations, and clinical
									entries for {animalName}.
								</p>
							</div>
						</div>

						{/* Aggregated Health Metrics */}
						<div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6">
							<div className="text-center px-3">
								<p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
									{sortedRecords.length}
								</p>
								<p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
									Log{sortedRecords.length > 1 ? "s" : ""}
								</p>
							</div>
							<Separator orientation="vertical" className="h-8 hidden md:block" />
							<div className="text-center px-3">
								<p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
									{totalVaccinesCount}
								</p>
								<p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
									Vaccines
								</p>
							</div>
							<Separator orientation="vertical" className="h-8 hidden md:block" />
							<div className="text-center px-3">
								<p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
									{totalMedicationsCount}
								</p>
								<p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
									Meds
								</p>
							</div>
							<Separator orientation="vertical" className="h-8 hidden md:block" />
							<div className="text-center px-3">
								<p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
									{allConditions.length}
								</p>
								<p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
									Conditions
								</p>
							</div>
						</div>
					</div>
				</Card>

				{/* MAIN CONTENT GRID */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* LEFT COLUMN: Medical History Feed (2 Columns wide on LG) */}
					<div className="lg:col-span-2 space-y-6">
						<div className="flex items-center justify-between px-1">
							<div className="flex items-center gap-2">
								<History className="w-5 h-5 text-primary" />
								<h2 className="text-lg font-semibold tracking-tight">Clinical Timeline</h2>
							</div>
							<span className="text-xs text-muted-foreground">
								Showing {sortedRecords.length} historical{" "}
								{sortedRecords.length === 1 ? "entry" : "entries"}
							</span>
						</div>

						{sortedRecords.length > 0 ? (
							<div className="space-y-6">
								{sortedRecords.map((record, index) => {
									const vaccinesList: Vaccine[] = Array.isArray(record.vaccines)
										? (record.vaccines as Vaccine[])
										: [];
									const medicationsList: Medication[] = Array.isArray(record.medications)
										? (record.medications as Medication[])
										: [];
									const conditionsList: string[] = Array.isArray(record.conditions)
										? record.conditions
										: [];

									return (
										<Card
											key={record.id || index}
											className="border-border/60 shadow-sm relative overflow-hidden pt-0"
										>
											{/* Entry Header */}
											<CardHeader className="bg-accent/30 pb-4 pt-5 border-b border-border/40">
												<div className="flex items-center gap-2.5">
													<div className="p-2 rounded-lg bg-primary/10 text-primary">
														<Stethoscope className="w-4 h-4" />
													</div>
													<div>
														<CardTitle className="text-base font-semibold">
															Medical Record Entry
														</CardTitle>
														<CardDescription className="text-xs flex items-center gap-3 mt-0.5">
															<span className="flex items-center gap-1">
																<Clock className="w-3 h-3" />
																{formatDate(record.createdAt, {
																	month: "short",
																	day: "numeric",
																	year: "numeric",
																	hour: "numeric",
																	minute: "2-digit",
																})}
															</span>
														</CardDescription>
													</div>
												</div>
											</CardHeader>

											<CardContent className="pt-6 space-y-6">
												{/* 1. VACCINES SECTION */}
												{vaccinesList.length > 0 && (
													<div className="space-y-3">
														<div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
															<Syringe className="w-4 h-4 text-muted-foreground" />
															<span>
																Vaccinations Administered (
																{vaccinesList.length})
															</span>
														</div>
														<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
															{vaccinesList.map((vac, vIdx) => (
																<div
																	key={vIdx}
																	className="p-3 rounded-lg border border-border bg-accent/20 space-y-1"
																>
																	<div className="flex items-center justify-between gap-2">
																		<span className="font-medium text-sm flex items-center gap-1.5">
																			<CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
																			{vac.name}
																		</span>
																		<span className="text-[11px] text-muted-foreground font-mono">
																			{formatDate(vac.date)}
																		</span>
																	</div>
																	{vac.description && (
																		<p className="text-xs text-muted-foreground pl-5">
																			{vac.description}
																		</p>
																	)}
																</div>
															))}
														</div>
													</div>
												)}

												{/* 2. MEDICATIONS SECTION */}
												{medicationsList.length > 0 && (
													<div className="space-y-3">
														<div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
															<Pill className="w-4 h-4 text-muted-foreground" />
															<span>
																Medications Prescribed (
																{medicationsList.length})
															</span>
														</div>
														<div className="space-y-2">
															{medicationsList.map((med, mIdx) => (
																<div
																	key={mIdx}
																	className="p-3 rounded-lg border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
																>
																	<div>
																		<div className="flex items-center gap-2">
																			<span className="font-semibold text-sm">
																				{med.name}
																			</span>
																			<Badge
																				variant="outline"
																				className="text-[10px] bg-background border-border text-muted-foreground"
																			>
																				{med.dosage}
																			</Badge>
																		</div>
																		{med.frequency && (
																			<p className="text-xs text-muted-foreground mt-0.5">
																				Frequency: {med.frequency}
																			</p>
																		)}
																	</div>
																	<div className="text-[11px] text-muted-foreground shrink-0 bg-background/80 px-2.5 py-1 rounded border border-border/40">
																		{formatDate(med.startDate)} →{" "}
																		{med.endDate
																			? formatDate(med.endDate)
																			: "Ongoing"}
																	</div>
																</div>
															))}
														</div>
													</div>
												)}

												{/* 3. CONDITIONS SECTION */}
												{conditionsList.length > 0 && (
													<div className="space-y-2">
														<div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
															<ShieldAlert className="w-4 h-4 text-muted-foreground" />
															<span>Conditions & Diagnostic Notes</span>
														</div>
														<div className="flex flex-wrap gap-2">
															{conditionsList.map((cond, cIdx) => (
																<Badge
																	key={cIdx}
																	variant="secondary"
																	className="text-xs border border-border/50"
																>
																	{cond}
																</Badge>
															))}
														</div>
													</div>
												)}

												{/* 4. CLINICAL NOTES SECTION */}
												{record.notes && (
													<div className="space-y-2">
														<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
															<FileText className="w-4 h-4" />
															<span>Clinical Observations</span>
														</div>
														<p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap bg-muted/40 p-3.5 rounded-lg border border-border/40">
															{record.notes}
														</p>
													</div>
												)}

												{/* Record Footer / Checkup callout if set during this visit */}
												{record.nextCheckup && (
													<div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg">
														<span className="flex items-center gap-1.5 font-medium text-foreground">
															<CalendarIcon className="w-4 h-4 text-muted-foreground" />
															Follow-up Scheduled:
														</span>
														<span className="font-semibold text-foreground">
															{formatDate(record.nextCheckup)}
														</span>
													</div>
												)}
											</CardContent>
										</Card>
									);
								})}
							</div>
						) : (
							<Card className="border-dashed p-8 text-center bg-muted/20">
								<FolderOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
								<h3 className="font-semibold text-base mb-1">No Medical Records Logged</h3>
								<p className="text-xs text-muted-foreground max-w-sm mx-auto">
									There are currently no veterinary logs or medical entry records registered
									for this animal.
								</p>
							</Card>
						)}
					</div>

					{/* RIGHT COLUMN: Aggregated Health Summary & Alerts Sidebar */}
					<div className="space-y-6">
						{/* 1. NEXT SCHEDULED CHECKUP */}
						<Card className="border-info/30 bg-info/5 shadow-sm">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-2 text-info">
									<CalendarIcon className="w-5 h-5" />
									<CardTitle className="text-base font-semibold">
										Next Scheduled Checkup
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								{nextUpcomingCheckup ? (
									<div className="space-y-1">
										<p className="text-xl font-bold text-foreground">
											{formatDate(nextUpcomingCheckup, {
												weekday: "short",
												month: "long",
												day: "numeric",
												year: "numeric",
											})}
										</p>
										<p className="text-xs text-muted-foreground">
											Earliest upcoming appointment set across all records
										</p>
									</div>
								) : (
									<p className="text-xs text-muted-foreground italic">
										No upcoming checkups or follow-up appointments scheduled.
									</p>
								)}
							</CardContent>
						</Card>

						{/* 2. AGGREGATED CONDITIONS & ALLERGIES */}
						<Card className="border-border/60 shadow-sm">
							<CardHeader className="pb-3 border-b border-border/40">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
										<CardTitle className="text-base">All Active Conditions</CardTitle>
									</div>
									<Badge variant="outline" className="text-xs">
										{allConditions.length}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="pt-2">
								{allConditions.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{allConditions.map((condition, idx) => (
											<Badge
												key={idx}
												variant="outline"
												className="bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30 px-2.5 py-1 text-xs"
											>
												{condition}
											</Badge>
										))}
									</div>
								) : (
									<p className="text-xs text-muted-foreground italic">
										No ongoing health conditions or allergies recorded across all logs.
									</p>
								)}
							</CardContent>
						</Card>

						{/* 3. HISTORICAL METADATA & SYSTEM INFO */}
						<Card className="border-border/60 shadow-sm bg-muted/20">
							<CardHeader className="pb-2">
								<CardTitle className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
									System Summary
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-xs text-muted-foreground">
								<div className="flex items-center justify-between">
									<span>Total File Entries:</span>
									<span className="font-semibold text-foreground">
										{sortedRecords.length}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>First Recorded Visit:</span>
									<span>
										{formatDate(sortedRecords[sortedRecords.length - 1]?.createdAt)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Latest Medical Update:</span>
									<span>
										{formatDate(
											sortedRecords[0]?.updatedAt || sortedRecords[0]?.createdAt,
										)}
									</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
			<AddMedicalRecordSheet
				open={medicalSheetOpen}
				onOpenChange={setMedicalSheetOpen}
				animalName={animalName}
				animalId={animalId}
			/>
		</div>
	);
}
