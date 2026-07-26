import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Clock, Calendar, FileText, Tag, MapPin, User, Hash, Loader } from "lucide-react";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetFooter,
} from "~/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { toast } from "sonner";
import { createAnimalsApi } from "~/api/animals.api";
import { useState } from "react";

const EVENT_TYPES = [
	{ value: "rescued", label: "Rescued / Intake" },
	{ value: "vaccinated", label: "Vaccination Administered" },
	{ value: "medical_checkup", label: "Medical Checkup / Exam" },
	{ value: "fostered", label: "Foster Placement" },
	{ value: "adopted", label: "Adoption Completed" },
	{ value: "transferred", label: "Transfer to Facility" },
	{ value: "general", label: "General Milestone / Note" },
] as const;

type EventType = (typeof EVENT_TYPES)[number]["value"];

const metadataSchema = z.object({
	location: z.string().optional(),
	associatedPerson: z.string().optional(),
	referenceCodeOrBatch: z.string().optional(),
	numericValue: z.coerce.number().optional(),
});

const timelineFormSchema = z.object({
	eventType: z.enum([
		"rescued",
		"vaccinated",
		"medical_checkup",
		"fostered",
		"adopted",
		"transferred",
		"general",
	]),
	description: z.string().min(3, "Description must be at least 3 characters long."),
	eventDate: z.string().min(1, "Event date is required."),
	metadata: metadataSchema,
});

type TimelineFormValues = z.input<typeof timelineFormSchema>;

interface AddTimelineEventSheetProps {
	animalId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddTimelineEventSheet({ animalId, open, onOpenChange }: AddTimelineEventSheetProps) {
	const nowLocalIso = new Date().toISOString().slice(0, 16);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { handleSubmit, control, watch, reset } = useForm<TimelineFormValues>({
		resolver: zodResolver(timelineFormSchema),
		defaultValues: {
			eventType: "general",
			description: "",
			eventDate: nowLocalIso,
			metadata: {
				location: "",
				associatedPerson: "",
				referenceCodeOrBatch: "",
				numericValue: undefined,
			},
		},
	});

	const selectedEventType = watch("eventType");

	// Dynamic metadata labels based on selected event type
	const getMetadataLabels = (type: EventType) => {
		switch (type) {
			case "rescued":
				return {
					person: "Rescuer / Finder Name",
					ref: "Intake / Case ID",
					num: "Initial Weight (lbs)",
				};
			case "vaccinated":
				return {
					person: "Administered By (Vet/Tech)",
					ref: "Vaccine Batch #",
					num: "Dose Amount (ml)",
				};
			case "medical_checkup":
				return {
					person: "Attending Veterinarian",
					ref: "Diagnosis / Clinic Code",
					num: "Recorded Weight (lbs)",
				};
			case "fostered":
				return { person: "Foster Parent Name", ref: "Agreement ID", num: "Expected Duration (Days)" };
			case "adopted":
				return { person: "Adopter Name", ref: "Adoption Contract #", num: "Adoption Fee ($)" };
			case "transferred":
				return { person: "Destination Contact", ref: "Transfer Permit #", num: "" };
			default:
				return { person: "Associated Person", ref: "Reference Code", num: "Numeric Value" };
		}
	};

	const labels = getMetadataLabels(selectedEventType);

	const handleFormSubmit = async (values: TimelineFormValues) => {
		console.log(values);
		if (!animalId) {
			toast.error("Something went wrong. Please try again.");
			return;
		}
		setIsSubmitting(true);
		try {
			const animalsApi = createAnimalsApi();
			const resp = await animalsApi.addTimeline(animalId, values);
			if (resp.success) {
				toast.success("Timeline event added successfully.");
				reset();
				onOpenChange(false);
			} else {
				toast.error(resp.error?.message || "Something went wrong. Please try again.");
			}
		} catch (error: any) {
			toast.error(error?.message || "Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-xl overflow-y-auto">
				<SheetHeader className="p-6 pb-4 border-b border-border/60 space-y-1">
					<SheetTitle className="flex items-center gap-2 text-xl">
						<Clock className="w-5 h-5 text-primary" />
						Add Timeline Event
					</SheetTitle>
					<SheetDescription>
						Record a structured event to track this animal's history within the shelter.
					</SheetDescription>
				</SheetHeader>

				<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-6">
					{/* Event Type Select */}
					<Controller
						name="eventType"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name} className="flex items-center gap-1.5">
									<Tag className="w-4 h-4 text-muted-foreground" />
									Event Type <span className="text-destructive">*</span>
								</FieldLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
										<SelectValue placeholder="Select event category" />
									</SelectTrigger>
									<SelectContent>
										{EVENT_TYPES.map((type) => (
											<SelectItem key={type.value} value={type.value}>
												{type.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					{/* Event Date */}
					<Controller
						name="eventDate"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name} className="flex items-center gap-1.5">
									<Calendar className="w-4 h-4 text-muted-foreground" />
									Event Date & Time <span className="text-destructive">*</span>
								</FieldLabel>
								<Input
									type="datetime-local"
									id={field.name}
									aria-invalid={fieldState.invalid}
									{...field}
								/>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					{/* Description */}
					<Controller
						name="description"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name} className="flex items-center gap-1.5">
									<FileText className="w-4 h-4 text-muted-foreground" />
									Description / Notes <span className="text-destructive">*</span>
								</FieldLabel>
								<Textarea
									placeholder="Provide specific details about what occurred..."
									className="resize-none h-24"
									id={field.name}
									aria-invalid={fieldState.invalid}
									{...field}
								/>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					<Separator className="my-4" />

					{/* Structured Metadata Section */}
					<div className="space-y-4">
						<div>
							<h4 className="text-sm font-semibold text-foreground">Structured Metadata</h4>
							<p className="text-xs text-muted-foreground">
								Contextual properties mapped to this event type.
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Controller
								name="metadata.location"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel
											htmlFor={field.name}
											className="text-xs flex items-center gap-1"
										>
											<MapPin className="w-3 h-3 text-muted-foreground" />
											Location / Facility
										</FieldLabel>
										<Input
											placeholder="e.g., Main Shelter / Room B"
											id={field.name}
											aria-invalid={fieldState.invalid}
											{...field}
										/>
										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</Field>
								)}
							/>

							<Controller
								name="metadata.associatedPerson"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel
											htmlFor={field.name}
											className="text-xs flex items-center gap-1"
										>
											<User className="w-3 h-3 text-muted-foreground" />
											{labels.person}
										</FieldLabel>
										<Input
											placeholder="Name or staff member"
											id={field.name}
											aria-invalid={fieldState.invalid}
											{...field}
										/>
										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</Field>
								)}
							/>

							<Controller
								name="metadata.referenceCodeOrBatch"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel
											htmlFor={field.name}
											className="text-xs flex items-center gap-1"
										>
											<Hash className="w-3 h-3 text-muted-foreground" />
											{labels.ref || "Reference Code"}
										</FieldLabel>
										<Input
											placeholder="Batch #, ID, or code"
											id={field.name}
											aria-invalid={fieldState.invalid}
											{...field}
										/>
										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</Field>
								)}
							/>

							<Controller
								name="metadata.numericValue"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel
											htmlFor={field.name}
											className="text-xs flex items-center gap-1"
										>
											<span>📊</span>
											{labels.num || "Numeric Value"}
										</FieldLabel>
										<Input
											type="number"
											step="0.01"
											placeholder="0.00"
											id={field.name}
											aria-invalid={fieldState.invalid}
											{...field}
											value={field.value as string | number}
										/>
										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</Field>
								)}
							/>
						</div>
					</div>

					<SheetFooter className="flex px-0 flex-row items-center justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							size={"lg"}
							disabled={isSubmitting}
							onClick={() => onOpenChange(false)}
							className="text-xs cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							size={"lg"}
							disabled={isSubmitting}
							className="text-xs font-medium cursor-pointer"
						>
							{isSubmitting ? <Loader className="w-3 h-3 mr-1 animate-spin" /> : null}
							Save
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
