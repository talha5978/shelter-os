import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { PawPrint, Mail, Phone, MapPin, Clock, Loader } from "lucide-react";
import type { AllFosterRequests } from "~/types/animals";
import { Link, useRevalidator } from "react-router";
import { createAnimalsApi } from "~/api/animals.api";
import { useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

interface FosterRequestCardProps {
	foster: AllFosterRequests["fosters"][number];
}

type LoadingState = { action: "approve" | "reject" | "end" | null; state: boolean };

export function FosterRequestCard({ foster }: FosterRequestCardProps) {
	const revalidator = useRevalidator();

	const [loading, setLoading] = useState<LoadingState>({
		action: null,
		state: false,
	});

	const mainPhoto =
		Array.isArray(foster.animalPhotos) && foster.animalPhotos.length > 0
			? foster.animalPhotos[0]?.url
			: null;

	const statusColor =
		foster.status === "applied"
			? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
			: foster.status === "active"
				? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
				: "bg-muted text-muted-foreground";

	const onApprove = async (fosterId: string) => {
		setLoading({ action: "approve", state: true });
		try {
			const animalsApi = createAnimalsApi();
			const result = await animalsApi.approveFosterRequest(fosterId);
			if (result.success) {
				toast.success(result.message || "Foster request approved successfully");
			} else {
				toast.error(result.error?.message || "Failed to approve foster request");
			}
		} catch (error: any) {
			toast.error(error?.message || "Failed to approve foster request");
		} finally {
			setLoading({ action: null, state: false });
			revalidator.revalidate();
		}
	};

	const onReject = async (fosterId: string) => {
		setLoading({ action: "reject", state: true });
		try {
			const animalsApi = createAnimalsApi();
			const result = await animalsApi.rejectFosterRequest(fosterId);
			if (result.success) {
				toast.warning(result.message || "Foster request rejected successfully");
			} else {
				toast.error(result.error?.message || "Failed to reject foster request");
			}
		} catch (error: any) {
			toast.error(error?.message || "Failed to reject foster request");
		} finally {
			setLoading({ action: null, state: false });
			revalidator.revalidate();
		}
	};

	const onTerminate = async (fosterId: string) => {
		setLoading({ action: "end", state: true });
		try {
			const animalsApi = createAnimalsApi();
			const result = await animalsApi.terminateFosterRequest(fosterId);
			if (result.success) {
				toast.success(result.message || "Foster request terminated successfully");
			} else {
				toast.error(result.error?.message || "Failed to terminate foster request");
			}
		} catch (error: any) {
			toast.error(error?.message || "Failed to terminate foster request");
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
						alt={foster.animalName || "Animal"}
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
					<Badge className={`text-xs border ${statusColor}`}>{foster.status?.toUpperCase()}</Badge>
				</div>

				{(foster.status === "ended" || foster.status === "terminated") && (
					<div className="absolute inset-0 bg-background/30 backdrop-blur-[1px] flex items-center justify-center overflow-hidden">
						{/* SVG Diagonal Cross Lines */}
						<svg
							className="absolute inset-0 w-full h-full stroke-destructive/40"
							strokeWidth="2.5"
						>
							<line x1="0" y1="0" x2="100%" y2="100%" />
							<line x1="100%" y1="0" x2="0" y2="100%" />
						</svg>

						{/* Center Warning Tag */}
						<div className="z-10 bg-destructive text-destructive-foreground px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest border border-destructive-foreground/20 shadow-md -rotate-6">
							Terminated
						</div>
					</div>
				)}
			</div>

			<div className="p-4 space-y-3">
				{/* Animal Info */}
				<div>
					<h3 className="font-semibold text-base leading-tight">
						{foster.animalName || "Unnamed"}
					</h3>
					<p className="text-xs text-muted-foreground mt-0.5">
						{foster.animalCode}
						{foster.animalBreed ? ` • ${foster.animalBreed}` : ""}
					</p>
				</div>

				{/* Foster Applicant */}
				<Link to={`/users?q=${foster.email}`}>
					<div className="rounded-lg bg-muted/40 p-3 space-y-1.5 cursor-pointer hover:bg-muted/70 duration-100 ease-in group">
						<p className="text-sm font-medium group-hover:underline underline-offset-4">
							{foster.fullName}
						</p>
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<Mail className="w-3 h-3 shrink-0" />
							<span className="truncate">{foster.email}</span>
						</div>
						{foster.phone && (
							<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
								<Phone className="w-3 h-3 shrink-0" />
								<span>{foster.phone}</span>
							</div>
						)}
						{foster.location && (
							<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
								<MapPin className="w-3 h-3 shrink-0" />
								<span>{foster.location}</span>
							</div>
						)}
					</div>
				</Link>

				{/* AI Match Score + Notes */}
				{(foster.matchScore != null || foster.notes) && (
					<div className="rounded-lg border border-border/60 bg-background p-3 space-y-2 mt-4">
						<div className="flex items-center justify-between gap-2">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								AI Match
							</p>

							{foster.matchScore != null && (
								<Badge
									variant="outline"
									className={`text-xs font-semibold ${
										foster.matchScore >= 80
											? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300"
											: foster.matchScore >= 60
												? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300"
												: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300"
									}`}
								>
									{foster.matchScore}% match
								</Badge>
							)}
						</div>

						{/* Progress bar */}
						{foster.matchScore != null && (
							<div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
								<div
									className={`h-full rounded-full transition-all ${
										foster.matchScore >= 80
											? "bg-emerald-500"
											: foster.matchScore >= 60
												? "bg-amber-500"
												: "bg-rose-500"
									}`}
									style={{ width: `${Math.min(100, Math.max(0, foster.matchScore))}%` }}
								/>
							</div>
						)}

						{/* AI Notes / Summary */}
						{foster.notes && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
											{foster.notes}
										</p>
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-xs">{foster.notes}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</div>
				)}

				{/* Meta */}
				<div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
					<div className="flex items-center gap-1">
						<Clock className="w-3 h-3" />
						{new Date(foster.createdAt).toLocaleDateString()}
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2 pt-1">
					{foster.status === "applied" && (
						<Button
							size="sm"
							disabled={loading.action === "approve" && loading.state}
							className="flex-1 text-xs"
							onClick={() => onApprove(foster.id)}
						>
							{loading.action === "approve" && loading.state && (
								<Loader className="mr-1 animate-spin" />
							)}
							Approve
						</Button>
					)}
					{foster.status === "applied" && (
						<Button
							size="sm"
							variant="destructive"
							className="flex-1 text-xs"
							onClick={() => onReject(foster.id)}
							disabled={loading.action === "reject" && loading.state}
						>
							{loading.action === "reject" && loading.state && (
								<Loader className="mr-1 animate-spin" />
							)}
							Reject
						</Button>
					)}
					{foster.status === "approved" && (
						<Button
							size="sm"
							variant="destructive"
							className="flex-1 text-xs"
							onClick={() => onTerminate(foster.id)}
							disabled={loading.action === "end" && loading.state}
						>
							{loading.action === "end" && loading.state && (
								<Loader className="mr-1 animate-spin" />
							)}
							Terminate
						</Button>
					)}

					{foster.status === "ended" && (
						<p className="text-xs text-muted-foreground italic">
							This foster term has been terminated.
						</p>
					)}
				</div>
			</div>
		</Card>
	);
}
