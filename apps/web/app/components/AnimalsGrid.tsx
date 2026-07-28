import { useState } from "react";
import { useSearchParams } from "react-router";
import { Search, ChevronLeft, ChevronRight, PawPrint, SlidersHorizontal, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Checkbox } from "~/components/ui/checkbox";
import type { AnimalProfile, AnimalsResponse } from "~/types/animals";
import type { Species } from "@workspace/db";
import AnimalProfileSheet from "~/components/AnimalsProfile";

interface AnimalsGridProps {
	data: AnimalsResponse;
	onPageChange?: (page: number) => void;
	onSearchChange?: (search: string) => void;
	onSpeciesChange?: (species: Species[]) => void;
	animalProfile: AnimalProfile | null;
}

const SPECIES_OPTIONS: { label: string; value: Species }[] = [
	{ label: "Dogs", value: "dog" },
	{ label: "Cats", value: "cat" },
	{ label: "Rabbits", value: "rabbit" },
	{ label: "Birds", value: "bird" },
	{ label: "Other Animals", value: "other" },
];

export default function AnimalsGrid({
	data,
	onPageChange,
	onSearchChange,
	onSpeciesChange,
	animalProfile,
}: AnimalsGridProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSpecies, setSelectedSpecies] = useState<Species[]>([]);

	const [searchParams, setSearchParams] = useSearchParams();

	const [open, setOpen] = useState(false);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setSearchQuery(query);
		onSearchChange?.(query);
	};

	const toggleSpecies = (species: Species) => {
		const updated = selectedSpecies.includes(species)
			? selectedSpecies.filter((s) => s !== species)
			: [...selectedSpecies, species];

		setSelectedSpecies(updated);
		onSpeciesChange?.(updated);
	};

	const clearSpeciesFilter = () => {
		setSelectedSpecies([]);
		onSpeciesChange?.([]);
	};

	const { animals, pagination } = data;

	return (
		<>
			<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* SEARCH AND MULTI-SELECT FILTERS BAR */}
				<div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
					{/* Search Bar */}
					<div className="relative flex-1">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
						<Input
							type="text"
							placeholder="Search by name, breed, or personality..."
							value={searchQuery}
							onChange={handleSearch}
							className="pl-10 pr-4 w-full"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => {
									setSearchQuery("");
									onSearchChange?.("");
								}}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					{/* Species Multi-Select Dropdown Popover */}
					<div className="flex items-center gap-2">
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" className="gap-2 shrink-0 cursor-pointer">
									<SlidersHorizontal className="w-4 h-4" />
									<span>Species</span>
									{selectedSpecies.length > 0 && (
										<Badge
											variant="secondary"
											className="ml-1 rounded-full px-2 py-0.5 text-xs font-semibold"
										>
											{selectedSpecies.length}
										</Badge>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent align="end" className="w-56 p-3 space-y-3">
								<div className="flex items-center justify-between pb-2 border-b border-border">
									<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
										Filter Species
									</span>
									{selectedSpecies.length > 0 && (
										<button
											type="button"
											onClick={clearSpeciesFilter}
											className="text-xs text-primary hover:underline font-medium"
										>
											Reset
										</button>
									)}
								</div>
								<div className="space-y-2">
									{SPECIES_OPTIONS.map((option) => {
										const isChecked = selectedSpecies.includes(option.value);
										return (
											<div
												key={option.value}
												onClick={() => toggleSpecies(option.value)}
												className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors"
											>
												<Checkbox checked={isChecked} />
												<span className="text-sm font-medium leading-none">
													{option.label}
												</span>
											</div>
										);
									})}
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				{/* SELECTED SPECIES BADGES */}
				{selectedSpecies.length > 0 && (
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-xs font-medium text-muted-foreground">Active Filters:</span>
						{selectedSpecies.map((species) => (
							<Badge
								key={species}
								variant="secondary"
								className="gap-1 pl-2.5 pr-1.5 py-1 text-xs flex items-center"
							>
								{SPECIES_OPTIONS.find((s) => s.value === species)?.label || species}
								<button
									type="button"
									onClick={() => toggleSpecies(species)}
									className="rounded-full hover:bg-muted p-0.5"
								>
									<X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
								</button>
							</Badge>
						))}
						<Button
							variant="ghost"
							size="sm"
							onClick={clearSpeciesFilter}
							className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
						>
							Clear All
						</Button>
					</div>
				)}

				{/* ANIMALS CARD GRID */}
				{animals.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{animals.map((animal) => {
							const mainPhoto = animal.photos?.[0]?.url || "/placeholder-animal.jpg";

							return (
								<Card
									key={animal.id}
									className="overflow-hidden group flex flex-col justify-between border-border hover:shadow-md transition-all duration-300 pb-2 pt-0"
								>
									<div>
										{/* Image Container with Badge overlay */}
										<div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
											<img
												src={mainPhoto}
												alt={animal.name || "Rescued Animal"}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
												onError={(e) => {
													// Fallback image handling
													(e.target as HTMLImageElement).src =
														"https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop";
												}}
											/>
											<div className="absolute top-3 left-3 flex gap-2 flex-wrap">
												<Badge className="bg-background/90 text-foreground backdrop-blur-md border border-border shadow-xs font-semibold">
													{animal.species.toUpperCase()}
												</Badge>
											</div>
											{animal.status && (
												<Badge
													className={`absolute top-3 right-3 shadow-xs font-semibold ${
														animal.status === "foster"
															? "bg-emerald-500 text-white"
															: "bg-amber-500 text-white"
													}`}
												>
													{animal.status === "foster"
														? "Foster Ready"
														: "Adoption Ready"}
												</Badge>
											)}
										</div>

										<CardHeader className="p-4 pb-2 space-y-1">
											<div className="flex justify-between items-start gap-2">
												<h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">
													{animal.name || "Unnamed Companion"}
												</h3>
											</div>
											<p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
												<span>{animal.breed || "Mixed Breed"}</span>
												{animal.gender && (
													<>
														<span>•</span>
														<span>
															{animal.gender.charAt(0).toUpperCase() +
																animal.gender.slice(1)}
														</span>
													</>
												)}
												{animal.age && (
													<>
														<span>•</span>
														<span>{animal.age}</span>
													</>
												)}
											</p>
										</CardHeader>

										<CardContent className="px-4 pt-1 space-y-3">
											{animal.description && (
												<p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
													{animal.description}
												</p>
											)}
										</CardContent>
									</div>

									<CardFooter className="p-4 pt-0 gap-2">
										<Button
											size="sm"
											className="w-full gap-2 cursor-pointer"
											onClick={() => {
												const q = searchParams.get("q");
												const page = searchParams.get("page");

												setSearchParams({
													...(q && { q }),
													...(page && { page }),
													animalId: String(animal.id),
												});

												setOpen(true);
											}}
										>
											<PawPrint className="w-4 h-4" />
											<span>View Profile</span>
										</Button>
									</CardFooter>
								</Card>
							);
						})}
					</div>
				) : (
					/* EMPTY STATE */
					<div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-dashed border-border my-8 space-y-3">
						<div className="p-3 bg-muted rounded-full text-muted-foreground">
							<PawPrint className="w-8 h-8" />
						</div>
						<h3 className="text-lg font-bold">No animals found</h3>
						<p className="text-sm text-muted-foreground max-w-sm">
							We couldn't find any animals matching your search or species selection. Try
							adjusting your search filters.
						</p>
						{(searchQuery || selectedSpecies.length > 0) && (
							<Button
								variant="outline"
								onClick={() => {
									setSearchQuery("");
									setSelectedSpecies([]);
									onSearchChange?.("");
									onSpeciesChange?.([]);
								}}
								className="mt-2 cursor-pointer"
							>
								Reset All Filters
							</Button>
						)}
					</div>
				)}

				{/* PAGINATION CONTROLS */}
				{pagination && pagination.totalPages > 1 && (
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
						<div className="text-xs text-muted-foreground">
							Showing page{" "}
							<span className="font-semibold text-foreground">{pagination.page}</span> of{" "}
							<span className="font-semibold text-foreground">{pagination.totalPages}</span> (
							{pagination.total} total animals)
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={!pagination.hasPrev}
								onClick={() => onPageChange?.(pagination.page - 1)}
								className="gap-1 cursor-pointer"
							>
								<ChevronLeft className="w-4 h-4" />
								<span>Previous</span>
							</Button>

							{/* Direct Page Numbers */}
							<div className="hidden md:flex items-center gap-1">
								{Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
									.filter((p) => {
										// Show current page, first, last, and immediate neighbors
										return (
											p === 1 ||
											p === pagination.totalPages ||
											Math.abs(p - pagination.page) <= 1
										);
									})
									.map((page, index, array) => {
										const showEllipsis = index > 0 && page - array[index - 1] > 1;

										return (
											<div key={page} className="flex items-center">
												{showEllipsis && (
													<span className="px-2 text-xs text-muted-foreground">
														...
													</span>
												)}
												<Button
													variant={pagination.page === page ? "default" : "outline"}
													size="sm"
													onClick={() => onPageChange?.(page)}
													className="w-8 h-8 p-0 cursor-pointer"
												>
													{page}
												</Button>
											</div>
										);
									})}
							</div>

							<Button
								variant="outline"
								size="sm"
								disabled={!pagination.hasNext}
								onClick={() => onPageChange?.(pagination.page + 1)}
								className="gap-1 cursor-pointer"
							>
								<span>Next</span>
								<ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				)}
			</div>
			<AnimalProfileSheet
				open={open}
				onOpenChange={() => {
					setOpen(false);
					const q = searchParams.get("q")?.trim() ?? "";
					const page = Number(searchParams.get("page") ?? String(1));
					setSearchParams({ q, page: String(page) });
				}}
				data={animalProfile}
			/>
		</>
	);
}
