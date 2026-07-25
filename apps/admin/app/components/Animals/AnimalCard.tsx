import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, MoreVertical, ArrowRight, Dog, Cat, PawPrint } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { AllAnimalsResponse } from "~/types/animals";
import { Badge } from "~/components/ui/badge";

// --- Age Formatter Helper ---
function formatAnimalAge(ageInput: string | number | null | undefined): string {
	if (ageInput === null || ageInput === undefined) return "";
	const age = typeof ageInput === "string" ? parseFloat(ageInput) : ageInput;
	if (isNaN(age)) return "";

	if (age === 0) return "Newborn";

	// If under 1 year, convert to months (e.g., 0.5 -> 6 mos)
	if (age < 1) {
		const months = Math.round(age * 12);
		return months <= 1 ? "1 month" : `${months} months`;
	}

	// Exactly 1 year
	if (age === 1) return "1 yr";

	// Over 1 year (supports decimals like 1.5 yrs)
	return `${age} yrs`;
}

// Helper to safely extract image URL
function getMediaUrl(asset: any): string {
	if (!asset) return "";
	if (typeof asset === "string") return asset;
	return asset.url || asset.preview || asset.src || "";
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

function getStatusBadge(status: string) {
	switch (status) {
		case "adoption_ready":
			return (
				<Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-medium">
					Adoption Ready
				</Badge>
			);
		case "adopted":
			return (
				<Badge variant="secondary" className="font-medium">
					Adopted
				</Badge>
			);
		case "foster":
			return (
				<Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20 font-medium">
					In Foster
				</Badge>
			);
		case "medical":
			return (
				<Badge variant="destructive" className="font-medium">
					Medical Care
				</Badge>
			);
		case "intake":
			return (
				<Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium">
					Intake Processing
				</Badge>
			);
		case "rescued":
		default:
			return (
				<Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/20 font-medium">
					Rescued
				</Badge>
			);
	}
}

type AnimalItem = AllAnimalsResponse["animals"][number];

export function AnimalCard({
	animal,
	onAddMedicalRecord,
}: {
	animal: AnimalItem;
	onAddMedicalRecord?: () => void;
}) {
	const [activePhotoIdx, setActivePhotoIdx] = useState(0);
	const photos = animal.photos ?? [];
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

	const formattedAge = formatAnimalAge(animal.age);

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

							{/* Carousel Controls (visible when multiple photos exist) */}
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
									<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-xs">
										{photos.map((_, idx) => (
											<div
												key={idx}
												className={`h-1.5 transition-all ${
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
						/* Placeholder when no image exists */
						<div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-muted/30 to-muted/80 p-4 text-center">
							{getSpeciesIcon(animal.species)}
							<span className="text-xs text-muted-foreground/70 mt-2 font-medium">
								No photos uploaded
							</span>
						</div>
					)}

					{/* Animal ID Badge on Image Top-Left */}
					<div className="absolute top-2.5 left-2.5">
						<span className="px-2 py-0.5 bg-background/90 text-[11px] font-mono font-semibold tracking-wider text-foreground shadow-xs border border-border/40">
							{animal.animalId}
						</span>
					</div>
					{/* Actions Dropdown Top-Right */}
					<div className="absolute top-2.5 right-2.5">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size="icon-xs" variant="outline">
									<MoreVertical className="w-3.5 h-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-40">
								<DropdownMenuItem asChild>
									<Link to={`/animals/${animal.id}`}>View Details</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to={`/animals/${animal.id}/edit`}>Edit Profile</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={onAddMedicalRecord ? () => onAddMedicalRecord() : undefined}
								>
									Medical Records
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Card Main Body */}
				<CardHeader className="px-4 pt-4">
					<div className="flex items-start justify-between gap-2">
						<div>
							<h3 className="font-semibold text-lg leading-snug tracking-tight text-foreground line-clamp-1">
								{animal.name || "Unnamed Animal"}
							</h3>
							<p className="text-xs text-muted-foreground capitalize mt-0.5">
								{animal.breed || animal.species}
							</p>
						</div>
						<div className="shrink-0">{getStatusBadge(animal.status)}</div>
					</div>
				</CardHeader>

				<CardContent className="px-4 pt-4 space-y-2 text-xs text-muted-foreground">
					<div className="flex items-center gap-2 pt-1 font-medium">
						{animal.gender && (
							<span className="capitalize text-foreground/80">{animal.gender}</span>
						)}
						{animal.gender && formattedAge && <span className="text-muted-foreground/40">•</span>}
						{formattedAge && <span className="text-foreground/80">{formattedAge}</span>}
					</div>

					{animal.description && (
						<p className="line-clamp-2 text-muted-foreground/90 text-xs leading-relaxed pt-1">
							{animal.description}
						</p>
					)}
				</CardContent>
			</div>

			{/* Card Footer */}
			<CardFooter className="pt-0">
				<Button variant="outline" size="sm" className="w-full text-xs font-medium" asChild>
					<Link to={`/animals/${animal.id}`}>
						View Profile
						<ArrowRight className="ml-1 w-3.5 h-3.5" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
