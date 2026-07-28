import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { PawPrint, Mail, Phone, MapPin, Clock, Loader } from "lucide-react";
import type { AllAdoptionRequests } from "~/types/animals";
import { Link, useRevalidator } from "react-router";
import { createAnimalsApi } from "~/api/animals.api";
import { useState } from "react";
import { toast } from "sonner";

interface AdoptionRequestCardProps {
	adoption: AllAdoptionRequests["adoptions"][number];
}

type LoadingState = { action: "approve" | "reject" | "end" | null; state: boolean };

export function AdoptionRequestCard({ adoption }: AdoptionRequestCardProps) {
	const revalidator = useRevalidator();

	const [loading, setLoading] = useState<LoadingState>({
		action: null,
		state: false,
	});

	const mainPhoto =
		Array.isArray(adoption.animalPhotos) && adoption.animalPhotos.length > 0
			? adoption.animalPhotos[0]?.url
			: null;

	const statusColor =
		adoption.applicationDate && adoption.approvalDate == null
			? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
			: adoption.approvalDate
				? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
				: "bg-muted text-muted-foreground";

	const onApprove = async (id: string) => {
		const alert = confirm(
			"Are you sure you want to approve this adoption request? This action cannot be undone.",
		);
		if (!alert) return;

		setLoading({ action: "approve", state: true });
		try {
			const animalsApi = createAnimalsApi();
			const result = await animalsApi.approveAdoptionRequest(id);
			if (result.success) {
				toast.success(result.message || "Adoption request approved successfully");
			} else {
				toast.error(result.error?.message || "Failed to approve adoption request");
			}
		} catch (error: any) {
			toast.error(error?.message || "Failed to approve adoption request");
		} finally {
			setLoading({ action: null, state: false });
			revalidator.revalidate();
		}
	};

	return (
		<Card className="overflow-hidden border-border/60 pt-0 hover:shadow-md transition-shadow">
			{/* Animal Photo */}
			<div className="relative aspect-4/3 bg-muted">
				{mainPhoto ? (
					<img
						src={mainPhoto}
						alt={adoption.animalName || "Animal"}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-muted/30 to-muted/80 p-4 text-center">
						<PawPrint className="w-10 h-10 text-muted-foreground/60" />
						<span className="text-xs text-muted-foreground/70 mt-2 font-medium">
							No photos uploaded
						</span>
					</div>
				)}
				<div className="absolute top-3 left-3">
					<Badge className={`text-xs border ${statusColor}`}>
						{adoption.applicationDate && adoption.approvalDate == null ? "Pending" : null}
						{adoption.applicationDate && adoption.approvalDate ? "Approved" : null}
					</Badge>
				</div>
			</div>

			<div className="p-4 space-y-3">
				{/* Animal Info */}
				<div>
					<h3 className="font-semibold text-base leading-tight">
						{adoption.animalName || "Unnamed"}
					</h3>
					<p className="text-xs text-muted-foreground mt-0.5">
						{adoption.animalCode}
						{adoption.animalBreed ? ` • ${adoption.animalBreed}` : ""}
					</p>
				</div>

				{/* Adopter Applicant */}
				<Link to={`/users?q=${adoption.email}`}>
					<div className="rounded-lg bg-muted/40 p-3 space-y-1.5 cursor-pointer hover:bg-muted/70 duration-100 ease-in group">
						<p className="text-sm font-medium group-hover:underline underline-offset-4">
							{adoption.fullName}
						</p>
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<Mail className="w-3 h-3 shrink-0" />
							<span className="truncate">{adoption.email}</span>
						</div>
						{adoption.phone && (
							<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
								<Phone className="w-3 h-3 shrink-0" />
								<span>{adoption.phone}</span>
							</div>
						)}
						{adoption.location && (
							<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
								<MapPin className="w-3 h-3 shrink-0" />
								<span>{adoption.location}</span>
							</div>
						)}
					</div>
				</Link>

				{/* Meta */}
				<div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
					<div className="flex items-center gap-1">
						<Clock className="w-3 h-3" />
						{new Date(adoption.createdAt).toLocaleDateString()}
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2 pt-1">
					{adoption.applicationDate && adoption.approvalDate == null && (
						<Button
							size="sm"
							disabled={loading.action === "approve" && loading.state}
							className="flex-1 text-xs"
							onClick={() => onApprove(adoption.id)}
						>
							{loading.action === "approve" && loading.state && (
								<Loader className="mr-1 animate-spin" />
							)}
							Approve
						</Button>
					)}

					{adoption.applicationDate && adoption.approvalDate && (
						<p className="text-xs text-muted-foreground italic">
							Adoption of {adoption.animalName} ({adoption.animalCode}) has been successfully
							approved.
						</p>
					)}
				</div>
			</div>
		</Card>
	);
}
