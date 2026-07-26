import React, { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
	Clock,
	ShieldAlert,
	Syringe,
	Stethoscope,
	Home,
	Heart,
	ArrowRightLeft,
	FileText,
	MapPin,
	User,
	Hash,
	Calendar,
	AlertCircle,
	CheckCircle2,
	Plus,
} from "lucide-react";
import { AddTimelineEventSheet } from "~/components/Timeline/AddTimelineEventSheet";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { AnimalTimeline, TimelineMetaData } from "@workspace/db";
import { Button } from "~/components/ui/button";
import { useLoaderData } from "react-router";
import type { loader } from "~/routes/Animals/animals";
import type { ErrorResponse, SuccessResponse } from "~/types/response";
import { invalidateCache } from "~/utils/invalidate";

interface EventTypeConfig {
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	variant: "default" | "secondary" | "destructive" | "outline";
	colorClass: string;
	bgAccent: string;
	numLabel?: string;
}

// Visual mapping per event type
const EVENT_CONFIG: Record<string, EventTypeConfig> = {
	rescued: {
		label: "Rescued / Intake",
		icon: ShieldAlert,
		variant: "destructive",
		colorClass:
			"text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40",
		bgAccent: "bg-amber-500",
		numLabel: "Initial Weight",
	},
	vaccinated: {
		label: "Vaccination",
		icon: Syringe,
		variant: "default",
		colorClass:
			"text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40",
		bgAccent: "bg-blue-500",
		numLabel: "Dose Amount",
	},
	medical_checkup: {
		label: "Medical Exam",
		icon: Stethoscope,
		variant: "secondary",
		colorClass:
			"text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40",
		bgAccent: "bg-emerald-500",
		numLabel: "Recorded Weight",
	},
	fostered: {
		label: "Foster Placement",
		icon: Home,
		variant: "outline",
		colorClass:
			"text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40",
		bgAccent: "bg-purple-500",
		numLabel: "Duration (Days)",
	},
	adopted: {
		label: "Adopted",
		icon: Heart,
		variant: "default",
		colorClass:
			"text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40",
		bgAccent: "bg-rose-500",
		numLabel: "Adoption Fee",
	},
	transferred: {
		label: "Transferred",
		icon: ArrowRightLeft,
		variant: "outline",
		colorClass:
			"text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40",
		bgAccent: "bg-indigo-500",
	},
	general: {
		label: "General Note",
		icon: FileText,
		variant: "outline",
		colorClass:
			"text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40",
		bgAccent: "bg-slate-400",
	},
};

interface TimelineHistorySheetProps {
	animalId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TimelineHistorySheet({ animalId, open, onOpenChange }: TimelineHistorySheetProps) {
	const loaderData = useLoaderData<typeof loader>();
	const timeLineData = loaderData.timelineData as
		| SuccessResponse<{
				timeline: (AnimalTimeline & { metadata: TimelineMetaData })[];
				animal: {
					id: string;
					name: string;
					animalId: string;
				};
		  }>
		| ErrorResponse;

	const animal = timeLineData.success ? timeLineData.data.animal : null;
	const timelineList = timeLineData.success ? timeLineData.data.timeline : [];
	const isError = !timeLineData.success;

	const [addSheetOpen, setAddSheetOpen] = useState(false);

	return (
		<>
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-xl p-0 flex flex-col h-full bg-background">
					{/* Header */}
					<SheetHeader className="px-6 pt-6 pb-4 border-b border-border space-y-1">
						<div className="flex items-center gap-2">
							<div className="p-2 rounded-lg bg-primary/10 text-primary">
								<Clock className="w-5 h-5" />
							</div>
							<div>
								<SheetTitle className="text-lg font-semibold leading-tight">
									Timeline & History
								</SheetTitle>
								<SheetDescription className="text-xs text-muted-foreground mt-0.5">
									{animal ? (
										<span>
											Full lifecycle audit log for{" "}
											<strong className="text-foreground">{animal.name}</strong> (
											{animal.animalId})
										</span>
									) : (
										"Loading animal records..."
									)}
								</SheetDescription>
							</div>
						</div>
					</SheetHeader>

					<div className="px-6 w-full flex justify-items-end">
						<Button size="sm" className="ml-auto" onClick={() => setAddSheetOpen(true)}>
							<Plus className="w-4 h-4 mr-1" />
							Add Timeline
						</Button>
					</div>

					{/* Content Body */}
					<ScrollArea className="flex-1 px-6 py-4">
						{isError ? (
							<div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl my-6 bg-muted/20">
								<AlertCircle className="w-8 h-8 text-destructive mb-2" />
								<h4 className="text-sm font-semibold">Failed to load timeline</h4>
								<p className="text-xs text-muted-foreground mt-1 mb-4">
									Something went wrong while fetching the history logs.
								</p>
								<button
									type="button"
									onClick={() => {
										invalidateCache(`timeline:${animalId}`);
										window.location.reload();
									}}
									className="text-xs font-medium text-primary hover:underline"
								>
									Try again
								</button>
							</div>
						) : timelineList.length === 0 ? (
							<div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-xl my-6 bg-muted/10">
								<CheckCircle2 className="w-10 h-10 text-muted-foreground/50 mb-3" />
								<h4 className="text-sm font-semibold text-foreground">No Timeline Records</h4>
								<p className="text-xs text-muted-foreground mt-1 max-w-xs">
									There are no logged milestones or events recorded for this animal yet.
								</p>
							</div>
						) : (
							<div className="relative pl-6 space-y-4">
								{/* Visual Vertical Progress Bar */}
								<div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-border" />

								<Accordion type="single" collapsible className="space-y-3">
									{timelineList.map((item) => {
										const config = EVENT_CONFIG[item.eventType] || EVENT_CONFIG.general;
										const Icon = config.icon;
										const meta = (item.metadata as TimelineMetaData) || {};
										const dateObj = new Date(item.eventDate);

										return (
											<div key={item.id} className="relative group">
												{/* Visual Timeline Dot */}
												<div
													className={`absolute left-[-1.19rem] top-4 w-3 h-3 rounded-full border-2 border-background z-10 bg-border`}
												/>

												<AccordionItem
													value={item.id}
													className={`border rounded-xl transition-all duration-150 overflow-hidden ${config.colorClass}`}
												>
													<AccordionTrigger className="px-4 py-3 hover:no-underline flex items-start gap-3 text-left">
														<div className="flex-1 space-y-1 pr-2">
															<div className="flex items-center gap-2 flex-wrap">
																<Badge
																	variant="outline"
																	className="flex items-center gap-1 text-[11px] font-medium bg-background/80 backdrop-blur-sm"
																>
																	<Icon className="w-3 h-3" />
																	{config.label}
																</Badge>

																<span className="text-[11px] text-muted-foreground flex items-center gap-1">
																	<Calendar className="w-3 h-3" />
																	{format(dateObj, "MMM d, yyyy · p")}
																</span>
															</div>

															{/* Brief Description Snippet */}
															<p className="text-xs font-normal text-foreground line-clamp-1 pt-0.5">
																{item.description}
															</p>
														</div>
													</AccordionTrigger>

													<AccordionContent className="px-4 pb-4 pt-2 space-y-3 border-t border-border/40 bg-background/50">
														{/* Full Description */}
														<div>
															<span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
																Notes & Details
															</span>
															<p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
																{item.description}
															</p>
														</div>

														{/* Structured Metadata Grid */}
														{(meta.location ||
															meta.associatedPerson ||
															meta.referenceCodeOrBatch ||
															meta.numericValue !== undefined) && (
															<div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
																{meta.location && (
																	<div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md">
																		<MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
																		<div className="truncate">
																			<span className="text-[10px] block text-muted-foreground/80 leading-none">
																				Location
																			</span>
																			<span className="font-medium text-foreground truncate block">
																				{meta.location}
																			</span>
																		</div>
																	</div>
																)}

																{meta.associatedPerson && (
																	<div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md">
																		<User className="w-3.5 h-3.5 text-primary shrink-0" />
																		<div className="truncate">
																			<span className="text-[10px] block text-muted-foreground/80 leading-none">
																				Contact
																			</span>
																			<span className="font-medium text-foreground truncate block">
																				{meta.associatedPerson}
																			</span>
																		</div>
																	</div>
																)}

																{meta.referenceCodeOrBatch && (
																	<div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md">
																		<Hash className="w-3.5 h-3.5 text-primary shrink-0" />
																		<div className="truncate">
																			<span className="text-[10px] block text-muted-foreground/80 leading-none">
																				Reference / Batch
																			</span>
																			<span className="font-medium text-foreground truncate block">
																				{meta.referenceCodeOrBatch}
																			</span>
																		</div>
																	</div>
																)}

																{meta.numericValue !== undefined && (
																	<div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md">
																		<span className="text-xs shrink-0">
																			📊
																		</span>
																		<div className="truncate">
																			<span className="text-[10px] block text-muted-foreground/80 leading-none">
																				{config.numLabel || "Value"}
																			</span>
																			<span className="font-medium text-foreground truncate block">
																				{meta.numericValue}
																			</span>
																		</div>
																	</div>
																)}
															</div>
														)}

														{/* Footer Metadata (Created By & Time Ago) */}
														<div className="text-[10px] text-muted-foreground/80 pt-2 border-t border-border/20">
															<span>
																{formatDistanceToNow(dateObj, {
																	addSuffix: true,
																})}
															</span>
														</div>
													</AccordionContent>
												</AccordionItem>
											</div>
										);
									})}
								</Accordion>
							</div>
						)}
					</ScrollArea>
				</SheetContent>
			</Sheet>
			<AddTimelineEventSheet animalId={animalId} open={addSheetOpen} onOpenChange={setAddSheetOpen} />
		</>
	);
}
