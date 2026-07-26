import { useState } from "react";
import { Link } from "react-router";
import {
	ChevronLeft,
	ChevronRight,
	MoreVertical,
	ArrowRight,
	Dog,
	Cat,
	PawPrint,
	Calendar,
	AlertTriangle,
	ShieldAlert,
	CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import type { MediaAsset } from "@workspace/db";
import type { AllMedicalRecordsResp } from "~/types/animals";

// Helper to safely extract image URL
function getMediaUrl(asset: MediaAsset): string {
	if (!asset) return "";
	return asset.url || "";
}

function getSpeciesIcon(species: string) {
	switch (species.toLowerCase()) {
		case "dog":
			return <Dog className="w-8 h-8 text-muted-foreground/60" />;
		case "cat":
			return <Cat className="w-8 h-8 text-muted-foreground/60" />;
		default:
			return <PawPrint className="w-8 h-8 text-muted-foreground/60" />;
	}
}

// Medical specific status badge
function getMedicalStatusBadge(status: "overdue" | "upcoming" | "none") {
	switch (status) {
		case "overdue":
			return (
				<Badge variant="destructive" className="font-medium gap-1 px-1.5 py-0.5">
					<AlertTriangle className="w-3 h-3" />
					Overdue
				</Badge>
			);
		case "upcoming":
			return (
				<Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/20 font-medium gap-1 px-1.5 py-0.5">
					<Calendar className="w-3 h-3" />
					Upcoming
				</Badge>
			);
		case "none":
		default:
			return (
				<Badge variant="secondary" className="font-medium text-muted-foreground">
					Unscheduled
				</Badge>
			);
	}
}

// Date formatter
function formatDate(dateString: Date | string | null) {
	if (!dateString) return "Not Scheduled";
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function AnimalMedicalCard({ animal }: { animal: AllMedicalRecordsResp["animals"][number] }) {
	const [activePhotoIdx, setActivePhotoIdx] = useState(0);

	// Safely parse photos
	const photos = Array.isArray(animal.photos) ? animal.photos : [];
	const hasPhotos = photos.length > 0;

	const handlePrev = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setActivePhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
	};

	const handleNext = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setActivePhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
	};

	return (
		<Card className="group overflow-hidden flex flex-col justify-between border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 pt-0">
			<div>
				{/* Media Header / Mini Carousel */}
				<div className="relative aspect-4/3 w-full bg-muted/40 overflow-hidden select-none">
					{hasPhotos ? (
						<>
							<img
								src={getMediaUrl(photos[activePhotoIdx])}
								alt={animal.name || "Shelter Animal"}
								className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
							/>

							{/* Carousel Controls */}
							{photos.length > 1 && (
								<>
									<button
										type="button"
										onClick={handlePrev}
										className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-background/80 hover:bg-background text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
										aria-label="Previous Image"
									>
										<ChevronLeft className="w-4 h-4" />
									</button>
									<button
										type="button"
										onClick={handleNext}
										className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-background/80 hover:bg-background text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
										aria-label="Next Image"
									>
										<ChevronRight className="w-4 h-4" />
									</button>

									{/* Dots Indicator */}
									<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-xs rounded-full">
										{photos.map((_, idx) => (
											<div
												key={idx}
												className={`h-1.5 rounded-full transition-all ${
													idx === activePhotoIdx
														? "w-3 bg-white"
														: "w-1.5 bg-white/50"
												}`}
											/>
										))}
									</div>
								</>
							)}
						</>
					) : (
						/* Placeholder */
						<div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-muted/30 to-muted/80 p-4 text-center">
							{getSpeciesIcon(animal.species)}
							<span className="text-xs text-muted-foreground/70 mt-2 font-medium">
								No photos uploaded
							</span>
						</div>
					)}

					{/* Animal ID Badge on Image Top-Left */}
					<div className="absolute top-2.5 left-2.5">
						<span className="px-2 py-0.5 bg-background/95 text-[11px] font-mono font-bold tracking-wider text-foreground shadow-sm border border-border/40 rounded-sm">
							{animal.animalId}
						</span>
					</div>

					{/* Actions Dropdown Top-Right */}
					<div className="absolute top-2.5 right-2.5">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									size="icon"
									variant="secondary"
									className="h-7 w-7 bg-background/90 hover:bg-background shadow-sm border border-border/40"
								>
									<MoreVertical className="w-3.5 h-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-44">
								<DropdownMenuItem asChild className="font-medium text-primary">
									<Link to={`/animals/${animal.id}/medical-records`}>
										Manage Medical Info
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to={`/animals/${animal.id}/edit`}>Edit Profile</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to={`/animals/${animal.id}`}>View General Profile</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Card Main Body */}
				<CardHeader className="px-4 pt-4 pb-2">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0 flex-1">
							<h3 className="font-semibold text-lg leading-snug tracking-tight text-foreground truncate">
								{animal.name || "Unnamed Animal"}
							</h3>
							<p className="text-xs text-muted-foreground capitalize mt-0.5">
								{animal.species}
							</p>
						</div>
						<div className="shrink-0">{getMedicalStatusBadge(animal.checkupStatus)}</div>
					</div>
				</CardHeader>

				<CardContent className="px-4 space-y-3">
					{/* Checkup Row */}
					<div className="flex items-center justify-between text-sm bg-muted/40 p-2 rounded-md border border-border/40">
						<span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
							<Calendar className="w-3.5 h-3.5" />
							Next Checkup
						</span>
						<span
							className={`text-xs font-semibold ${animal.checkupStatus === "overdue" ? "text-destructive" : "text-foreground"}`}
						>
							{formatDate(animal.nextCheckup)}
						</span>
					</div>

					{/* Conditions Row */}
					<div className="space-y-1.5">
						<div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
							<ShieldAlert className="w-3.5 h-3.5" />
							Active Conditions ({animal.conditionsCount})
						</div>

						{animal.conditionsCount > 0 ? (
							<div className="flex flex-wrap gap-1.5">
								{/* Only show first 2 conditions to avoid breaking card layout */}
								{animal.activeConditions.slice(0, 2).map((condition, idx) => (
									<Badge
										key={idx}
										variant="outline"
										className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 px-1.5 py-0"
									>
										{condition}
									</Badge>
								))}
								{animal.conditionsCount > 2 && (
									<Badge
										variant="outline"
										className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0"
									>
										+{animal.conditionsCount - 2} more
									</Badge>
								)}
							</div>
						) : (
							<div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
								<CheckCircle2 className="w-3.5 h-3.5" />
								No active conditions
							</div>
						)}
					</div>
				</CardContent>
			</div>

			{/* Card Footer */}
			<CardFooter className="px-4 pt-3 border-t border-border/40 bg-accent/10">
				<Button variant="default" size="sm" className="w-full text-xs shadow-sm" asChild>
					<Link to={`/animals/${animal.id}/medical-records`}>
						Open Medical Log
						<ArrowRight className="ml-1.5 w-3.5 h-3.5" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
