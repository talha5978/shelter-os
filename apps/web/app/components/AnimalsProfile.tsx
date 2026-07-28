import { Sheet, SheetContent } from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { PawPrint, MapPin, Heart, Syringe, Clock, CheckCircle2, Mail } from "lucide-react";
import type { AnimalProfile } from "~/types/animals";
import { createAnimalsApi } from "~/api/animals.api";
import { useState } from "react";
import { toast } from "sonner";

interface PublicAnimalProfileSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: AnimalProfile | null;
}

export default function AnimalProfileSheet({ open, onOpenChange, data }: PublicAnimalProfileSheetProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	if (!data) return null;

	const { animal, timeline } = data;

	const mainPhoto = Array.isArray(animal.photos) && animal.photos.length > 0 ? animal.photos[0]?.url : null;

	const statusLabel =
		animal.status === "adoption_ready"
			? "Ready for Adoption"
			: animal.status === "foster"
				? "Looking for Foster"
				: animal.status;

	const onApplyFoster = async (animalId: string) => {
		setIsSubmitting(true);
		try {
			const animalsApi = createAnimalsApi();
			const resp = await animalsApi.applyFoster(animalId);

			if (resp.success) {
				setIsSuccess(true);
			} else {
				toast.error(resp.error?.message || "Failed to submit application");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const onApplyAdopt = async (animalId: string) => {
		setIsSubmitting(true);
		try {
			const animalsApi = createAnimalsApi();
			const resp = await animalsApi.applyAdoption(animalId);

			if (resp.success) {
				setIsSuccess(true);
			} else {
				toast.error(resp.error?.message || "Failed to submit application");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setIsSuccess(false);
		onOpenChange(false);
	};

	if (isSuccess) {
		return (
			<Sheet open={open} onOpenChange={handleClose}>
				<SheetContent className="sm:max-w-md w-full flex flex-col items-center justify-center p-8 text-center">
					<div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mb-5">
						<CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
					</div>

					<h2 className="text-2xl font-bold tracking-tight mb-2">Application Received!</h2>

					<p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-1">
						Thank you for your interest in{" "}
						<span className="font-medium text-foreground">{animal.name || "this animal"}</span>.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
						Our team will review your application and contact you shortly.
					</p>

					<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg mb-8">
						<Mail className="w-3.5 h-3.5" />
						<span>Check your email for updates</span>
					</div>

					<Button onClick={handleClose} className="w-full max-w-50">
						Done
					</Button>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-lg w-full flex flex-col h-full p-0 gap-0 overflow-hidden">
				{/* Header Image */}
				<div className="relative h-56 bg-muted shrink-0">
					{mainPhoto ? (
						<img
							src={mainPhoto}
							alt={animal.name || "Animal"}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<PawPrint className="w-16 h-16 text-muted-foreground/40" />
						</div>
					)}

					<div className="absolute bottom-3 left-4">
						<Badge className="bg-background/90 text-foreground border shadow-sm">
							{statusLabel}
						</Badge>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto">
					<div className="p-6 space-y-6">
						{/* Basic Info */}
						<div>
							<div className="flex items-start justify-between gap-3">
								<div>
									<h2 className="text-2xl font-bold tracking-tight">
										{animal.name || "Unnamed"}
									</h2>
									<p className="text-sm text-muted-foreground mt-0.5">
										{animal.animalId} • {animal.species}
										{animal.breed ? ` • ${animal.breed}` : ""}
									</p>
								</div>
							</div>

							{/* Quick Stats */}
							<div className="flex flex-wrap gap-2 mt-4">
								{animal.age && (
									<Badge variant="secondary" className="text-xs">
										{Number(animal.age)} yrs
									</Badge>
								)}
								{animal.gender && animal.gender !== "unknown" && (
									<Badge variant="secondary" className="text-xs capitalize">
										{animal.gender}
									</Badge>
								)}
								{animal.weight && (
									<Badge variant="secondary" className="text-xs">
										{Number(animal.weight)} kg
									</Badge>
								)}
								{animal.isVaccinated && (
									<Badge
										variant="outline"
										className="text-xs text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400"
									>
										<Syringe className="w-3 h-3 mr-1" />
										Vaccinated
									</Badge>
								)}
							</div>
						</div>

						<Separator />

						{/* Personality */}
						{animal.personality && (
							<div>
								<h3 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
									<Heart className="w-4 h-4 text-rose-500" />
									Personality
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{animal.personality}
								</p>
							</div>
						)}

						{/* Description */}
						{animal.description && (
							<div>
								<h3 className="text-sm font-semibold mb-1.5">About</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{animal.description}
								</p>
							</div>
						)}

						{/* Location */}
						{animal.foundLocation && (
							<div className="flex items-start gap-2 text-sm">
								<MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
								<span className="text-muted-foreground">Found in {animal.foundLocation}</span>
							</div>
						)}

						{/* Conditions */}
						{animal.conditions && animal.conditions.length > 0 && (
							<div>
								<h3 className="text-sm font-semibold mb-2">Health Notes</h3>
								<div className="flex flex-wrap gap-1.5">
									{animal.conditions.map((condition, idx) => (
										<Badge key={idx} variant="outline" className="text-xs">
											{condition}
										</Badge>
									))}
								</div>
							</div>
						)}

						<Separator />

						{/* Timeline */}
						{timeline && timeline.length > 0 && (
							<div>
								<h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
									<Clock className="w-4 h-4" />
									Journey Timeline
								</h3>
								<div className="space-y-4 relative before:absolute before:left-1.75 before:top-2 before:bottom-2 before:w-px before:bg-border">
									{timeline.map((event, idx) => (
										<div key={idx} className="relative pl-6">
											<div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-primary bg-background" />
											<p className="text-xs font-medium capitalize text-foreground">
												{event.eventType.replace("_", " ")}
											</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												{event.description}
											</p>
											<p className="text-[11px] text-muted-foreground/70 mt-1">
												{new Date(event.eventDate).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</p>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Footer CTAs */}
				<div className="p-4 border-t border-border/60 bg-muted/20 flex gap-2 shrink-0">
					{animal.status === "adoption_ready" && (
						<Button
							className="flex-1"
							disabled={isSubmitting}
							onClick={() => onApplyAdopt(animal.id)}
						>
							Apply to Adopt
						</Button>
					)}
					{(animal.status === "foster" || animal.status === "adoption_ready") && (
						<Button
							variant={animal.status === "foster" ? "default" : "outline"}
							className="flex-1"
							disabled={isSubmitting}
							onClick={() => onApplyFoster(animal.id)}
						>
							Apply to Foster
						</Button>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
