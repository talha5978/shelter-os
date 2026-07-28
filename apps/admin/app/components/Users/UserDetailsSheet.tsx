import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	Mail,
	Phone,
	MapPin,
	User,
	ShieldCheck,
	Home,
	Heart,
	Clock,
	PawPrint,
	CheckCircle2,
} from "lucide-react";
import type { UserDetails } from "~/types/users";

interface UserDetailsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: UserDetails | null;
}

function parseFosterExperience(raw: string | null) {
	if (!raw) return null;

	const get = (key: string) => {
		const match = raw.match(new RegExp(`\\[${key}:([^\\]]+)\\]`));
		return match?.[1] || null;
	};

	return {
		experience: get("experience"),
		duration: get("duration"),
		species: get("species"),
		housing: get("housing"),
		fencedYard: get("fencedYard"),
		activityLevel: get("activityLevel"),
		hasKids: get("hasKids"),
		hasOtherPets: get("hasOtherPets"),
		specialNeeds: get("specialNeeds"),
		maxAnimals: get("maxAnimals"),
	};
}

function formatLabel(value: string | null) {
	if (!value) return "—";
	return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function UserDetailsSheet({ open, onOpenChange, data }: UserDetailsSheetProps) {
	if (!data) return null;

	const { user, fosterHistory, adoptionHistory } = data;
	const fosterInfo = parseFosterExperience(user.fosterExperience);

	const initials = user.fullName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const roleLabel =
		user.role === "foster_volunteer"
			? "Foster Volunteer"
			: user.role === "shelter_staff"
				? "Shelter Staff"
				: user.role === "admin"
					? "Admin"
					: "Adopter";

	const avatarUrl =
		user.avatarUrl && typeof user.avatarUrl === "object" ? (user.avatarUrl as any).url : null;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-lg w-full flex flex-col h-full p-0 gap-0 overflow-hidden">
				{/* Header */}
				<SheetHeader className="p-6 pb-4 border-b border-border/60 shrink-0">
					<div className="flex items-center gap-4">
						<Avatar className="h-14 w-14 border">
							{avatarUrl && <AvatarImage src={avatarUrl} alt={user.fullName} />}
							<AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<SheetTitle className="text-xl truncate">{user.fullName}</SheetTitle>
							<SheetDescription className="flex items-center gap-2 mt-1">
								<Badge variant="secondary" className="text-xs">
									{roleLabel}
								</Badge>
								{user.isVerified && (
									<span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
										<ShieldCheck className="w-3.5 h-3.5" />
										Verified
									</span>
								)}
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				{/* Body */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Contact Info */}
					<section className="space-y-3">
						<h3 className="text-sm font-semibold flex items-center gap-1.5">
							<User className="w-4 h-4 text-muted-foreground" />
							Contact Information
						</h3>
						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Mail className="w-4 h-4 shrink-0" />
								<span className="truncate">{user.email}</span>
							</div>
							{user.phone && (
								<div className="flex items-center gap-2 text-muted-foreground">
									<Phone className="w-4 h-4 shrink-0" />
									<span>{user.phone}</span>
								</div>
							)}
							{(user.address || user.location) && (
								<div className="flex items-start gap-2 text-muted-foreground">
									<MapPin className="w-4 h-4 shrink-0 mt-0.5" />
									<span>{user.address || user.location}</span>
								</div>
							)}
							<div className="flex items-center gap-2 text-muted-foreground">
								<Clock className="w-4 h-4 shrink-0" />
								<span>
									Joined{" "}
									{new Date(user.createdAt).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</span>
							</div>
						</div>
					</section>

					{/* Foster Profile (only for foster volunteers) */}
					{user.role === "foster_volunteer" && fosterInfo && (
						<>
							<Separator />
							<section className="space-y-3">
								<h3 className="text-sm font-semibold flex items-center gap-1.5">
									<Home className="w-4 h-4 text-muted-foreground" />
									Foster Profile
								</h3>

								{user.availability && (
									<p className="text-xs text-muted-foreground">
										Availability:{" "}
										<span className="font-medium text-foreground capitalize">
											{formatLabel(user.availability)}
										</span>
									</p>
								)}

								<div className="grid grid-cols-2 gap-2">
									{[
										{ label: "Experience", value: fosterInfo.experience },
										{ label: "Duration", value: fosterInfo.duration },
										{ label: "Preferred Species", value: fosterInfo.species },
										{ label: "Housing", value: fosterInfo.housing },
										{ label: "Fenced Yard", value: fosterInfo.fencedYard },
										{ label: "Activity Level", value: fosterInfo.activityLevel },
										{ label: "Children", value: fosterInfo.hasKids },
										{ label: "Other Pets", value: fosterInfo.hasOtherPets },
										{ label: "Special Needs Exp.", value: fosterInfo.specialNeeds },
										{ label: "Max Animals", value: fosterInfo.maxAnimals },
									].map((item) => (
										<div
											key={item.label}
											className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
										>
											<p className="text-[11px] text-muted-foreground">{item.label}</p>
											<p className="text-xs font-medium mt-0.5 capitalize">
												{formatLabel(item.value)}
											</p>
										</div>
									))}
								</div>
							</section>
						</>
					)}

					{/* Foster History */}
					{fosterHistory && fosterHistory.length > 0 && (
						<>
							<Separator />
							<section className="space-y-3">
								<h3 className="text-sm font-semibold flex items-center gap-1.5">
									<PawPrint className="w-4 h-4 text-muted-foreground" />
									Foster History
									<Badge variant="secondary" className="ml-1 text-[10px]">
										{fosterHistory.length}
									</Badge>
								</h3>

								<div className="space-y-2">
									{fosterHistory.map((item) => {
										const photo =
											Array.isArray(item.animalPhotos) && item.animalPhotos.length > 0
												? item.animalPhotos[0]?.url
												: null;

										return (
											<div
												key={item.id}
												className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
											>
												<div className="h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
													{photo ? (
														<img
															src={photo}
															alt={item.animalName || "Animal"}
															className="h-full w-full object-cover"
														/>
													) : (
														<div className="h-full w-full flex items-center justify-center">
															<PawPrint className="w-5 h-5 text-muted-foreground/40" />
														</div>
													)}
												</div>
												<div className="min-w-0 flex-1">
													<p className="text-sm font-medium truncate">
														{item.animalName || "Unnamed"}
													</p>
													<p className="text-xs text-muted-foreground">
														{item.animalCode}
														{item.animalBreed ? ` • ${item.animalBreed}` : ""}
													</p>
												</div>
												<Badge
													variant="outline"
													className={`text-[10px] capitalize ${
														item.status === "active"
															? "text-emerald-700 border-emerald-200 bg-emerald-50"
															: item.status === "applied"
																? "text-amber-700 border-amber-200 bg-amber-50"
																: ""
													}`}
												>
													{item.status || "—"}
												</Badge>
											</div>
										);
									})}
								</div>
							</section>
						</>
					)}

					{/* Adoption History */}
					{adoptionHistory && adoptionHistory.length > 0 && (
						<>
							<Separator />
							<section className="space-y-3">
								<h3 className="text-sm font-semibold flex items-center gap-1.5">
									<Heart className="w-4 h-4 text-muted-foreground" />
									Adoption History
									<Badge variant="secondary" className="ml-1 text-[10px]">
										{adoptionHistory.length}
									</Badge>
								</h3>

								<div className="space-y-2">
									{adoptionHistory.map((item) => (
										<div
											key={item.id}
											className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
										>
											<div className="h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
												{item.animalPhotos && item.animalPhotos.length > 0 ? (
													<img
														src={item.animalPhotos[0].url}
														alt={item.animalName || "Animal"}
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="h-full w-full flex items-center justify-center">
														<PawPrint className="w-5 h-5 text-muted-foreground/40" />
													</div>
												)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium truncate">
													{item.animalName || "Unnamed"}
												</p>
												<p className="text-xs text-muted-foreground">
													{item.animalCode}
													{item.animalBreed ? ` • ${item.animalBreed}` : ""}
												</p>
												<p className="text-[11px] text-muted-foreground mt-0.5">
													Applied{" "}
													{new Date(item.applicationDate).toLocaleDateString()}
												</p>
											</div>
											{item.approvalDate ? (
												<Badge className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-200">
													<CheckCircle2 className="w-3 h-3 mr-1" />
													Approved
												</Badge>
											) : (
												<Badge
													variant="outline"
													className="text-[10px] text-amber-700"
												>
													Pending
												</Badge>
											)}
										</div>
									))}
								</div>
							</section>
						</>
					)}

					{/* Empty histories */}
					{user.role === "foster_volunteer" && fosterHistory.length === 0 && (
						<>
							<Separator />
							<p className="text-sm text-muted-foreground text-center py-4">
								No foster history yet.
							</p>
						</>
					)}
					{user.role === "adopter" && adoptionHistory.length === 0 && (
						<>
							<Separator />
							<p className="text-sm text-muted-foreground text-center py-4">
								No adoption applications yet.
							</p>
						</>
					)}
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-border/60 bg-muted/20 shrink-0">
					<Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
