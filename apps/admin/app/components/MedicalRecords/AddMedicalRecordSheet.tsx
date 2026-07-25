import { useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Syringe,
	Pill,
	Stethoscope,
	Calendar as CalendarIcon,
	Plus,
	Trash2,
	X,
	FileText,
	ShieldAlert,
	Loader,
} from "lucide-react";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
} from "~/components/ui/sheet";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { createAnimalsApi } from "~/api/animals.api";
import { toast } from "sonner";
import { useRevalidator } from "react-router";

const vaccineSchema = z.object({
	name: z.string().min(1, "Vaccine name is required"),
	date: z.string().min(1, "Date is required"),
	description: z.string().optional().nullable(),
});

const medicationSchema = z.object({
	name: z.string().min(1, "Medication name is required"),
	dosage: z.string().min(1, "Dosage is required"),
	frequency: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional().nullable(),
});

const medicalRecordSchema = z.object({
	vaccines: z.array(vaccineSchema).default([]),
	medications: z.array(medicationSchema).default([]),
	conditions: z.array(z.string()).default([]),
	nextCheckup: z.string().optional().nullable(),
	notes: z.string().optional().nullable(),
});

type MedicalRecordFormValues = z.input<typeof medicalRecordSchema>;

interface AddMedicalRecordSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	animalName?: string;
	animalId?: string;
}

export default function AddMedicalRecordSheet({
	open = true,
	onOpenChange,
	animalName = "Animal",
	animalId,
}: AddMedicalRecordSheetProps) {
	const [conditionInput, setConditionInput] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const revalidator = useRevalidator();

	const form = useForm<MedicalRecordFormValues>({
		resolver: zodResolver(medicalRecordSchema),
		defaultValues: {
			vaccines: [],
			medications: [],
			conditions: [],
			nextCheckup: "",
			notes: "",
		},
	});

	const {
		fields: vaccineFields,
		append: appendVaccine,
		remove: removeVaccine,
	} = useFieldArray({
		control: form.control,
		name: "vaccines",
	});

	const {
		fields: medicationFields,
		append: appendMedication,
		remove: removeMedication,
	} = useFieldArray({
		control: form.control,
		name: "medications",
	});

	// Tag management for conditions
	const handleAddCondition = () => {
		const trimmed = conditionInput.trim();
		if (!trimmed) return;
		const currentConditions = form.getValues("conditions") || [];
		if (!currentConditions.includes(trimmed)) {
			form.setValue("conditions", [...currentConditions, trimmed]);
		}
		setConditionInput("");
	};

	const handleRemoveCondition = (indexToRemove: number) => {
		const current = form.getValues("conditions") || [];
		form.setValue(
			"conditions",
			current.filter((_, idx) => idx !== indexToRemove),
		);
	};

	// Form Submission Handler
	const onSubmit = async (values: MedicalRecordFormValues) => {
		if (!animalId) {
			toast.error("Something went wrong. Please try again.");
			return;
		}

		const payload = {
			vaccines:
				values.vaccines && values.vaccines.length > 0
					? values.vaccines.map((v) => ({
							name: v.name,
							date: new Date(v.date),
							description: v.description || null,
						}))
					: [],
			medications:
				values.medications && values.medications.length > 0
					? values.medications.map((m) => ({
							name: m.name,
							dosage: m.dosage,
							frequency: m.frequency || undefined,
							startDate: m.startDate ? new Date(m.startDate) : undefined,
							endDate: m.endDate ? new Date(m.endDate) : null,
						}))
					: [],
			conditions: values.conditions,
			nextCheckup: values.nextCheckup ? new Date(values.nextCheckup) : null,
			notes: values.notes || null,
		};

		setIsSaving(true);

		try {
			const api = createAnimalsApi();
			const response = await api.addMedicalRecord(animalId, payload);

			if (response.success) {
				toast.success("Medical record added successfully!");
				form.reset();
				onOpenChange(false);
				revalidator.revalidate();
			} else {
				console.log(response.error);
				toast.error(response.error?.message || "Something went wrong. Please try again.");
			}
		} catch (error: any) {
			toast.error(error?.message || "Something went wrong. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-2xl w-full flex flex-col h-full p-0 gap-0">
				{/* Header */}
				<SheetHeader className="p-6 pb-4 border-b border-border/60">
					<div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
						<Stethoscope className="w-4 h-4" />
						Medical Log
					</div>
					<SheetTitle className="text-xl">Add Medical Record</SheetTitle>
					<SheetDescription>
						Log vaccinations, medications, conditions, and upcoming checkups for{" "}
						<span className="font-medium text-foreground">{animalName}</span>
					</SheetDescription>
				</SheetHeader>

				{/* Form Body */}
				<form
					id="medical-record-form"
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex-1 overflow-y-auto p-6 space-y-6"
				>
					{/* SECTION 1: Vaccines */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
								<Syringe className="w-4 h-4 text-amber-600 dark:text-amber-40" />
								Vaccinations
							</div>
							<Button
								type="button"
								variant="outline"
								size="icon-sm"
								onClick={() =>
									appendVaccine({
										name: "",
										date: new Date().toISOString().split("T")[0],
										description: "",
									})
								}
								className="h-8 text-xs cursor-pointer"
							>
								<Plus />
							</Button>
						</div>

						{vaccineFields.length === 0 ? (
							<p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-lg border border-dashed text-center">
								No vaccinations added for this record.
							</p>
						) : (
							<div className="space-y-3">
								{vaccineFields.map((fieldItem, index) => (
									<Card
										key={fieldItem.id}
										className="p-3 relative border-border/60 shadow-none space-y-3"
									>
										<button
											type="button"
											onClick={() => removeVaccine(index)}
											className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
										>
											<Trash2 className="w-4 h-4" />
										</button>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
											<Controller
												name={`vaccines.${index}.name`}
												control={form.control}
												render={({ field, fieldState }) => (
													<Field data-invalid={fieldState.invalid}>
														<FieldLabel htmlFor={field.name}>
															Vaccine Name
														</FieldLabel>
														<Input
															{...field}
															id={field.name}
															placeholder="e.g. Rabies, DHPP"
															className="h-8 text-xs"
															aria-invalid={fieldState.invalid}
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>

											<Controller
												name={`vaccines.${index}.date`}
												control={form.control}
												render={({ field, fieldState }) => (
													<Field data-invalid={fieldState.invalid}>
														<FieldLabel htmlFor={field.name}>
															Date Administered
														</FieldLabel>
														<Input
															type="date"
															{...field}
															id={field.name}
															className="h-8 text-xs"
															aria-invalid={fieldState.invalid}
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>
										</div>

										<Controller
											name={`vaccines.${index}.description`}
											control={form.control}
											render={({ field, fieldState }) => (
												<Field data-invalid={fieldState.invalid}>
													<Input
														{...field}
														value={field.value ?? ""}
														id={field.name}
														placeholder="Batch # or notes (optional)"
														className="h-8 text-xs"
														aria-invalid={fieldState.invalid}
													/>
													{fieldState.invalid && (
														<FieldError errors={[fieldState.error]} />
													)}
												</Field>
											)}
										/>
									</Card>
								))}
							</div>
						)}
					</div>

					<Separator className="bg-border/60" />

					{/* SECTION 2: Medications */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
								<Pill className="w-4 h-4 text-amber-600 dark:text-amber-40" />
								Medications & Treatments
							</div>
							<Button
								type="button"
								variant="outline"
								size="icon-sm"
								onClick={() =>
									appendMedication({
										name: "",
										dosage: "",
										frequency: "",
										startDate: new Date().toISOString().split("T")[0],
										endDate: "",
									})
								}
								className="h-8 text-xs cursor-pointer"
							>
								<Plus />
							</Button>
						</div>

						{medicationFields.length === 0 ? (
							<p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-lg border border-dashed text-center">
								No active medications added.
							</p>
						) : (
							<div className="space-y-3">
								{medicationFields.map((fieldItem, index) => (
									<Card
										key={fieldItem.id}
										className="p-3 relative border-border/60 shadow-none space-y-3"
									>
										<button
											type="button"
											onClick={() => removeMedication(index)}
											className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
										>
											<Trash2 className="w-4 h-4" />
										</button>

										<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
											<Controller
												name={`medications.${index}.name`}
												control={form.control}
												render={({ field, fieldState }) => (
													<Field data-invalid={fieldState.invalid}>
														<FieldLabel htmlFor={field.name}>Name</FieldLabel>
														<Input
															{...field}
															id={field.name}
															placeholder="Amoxicillin"
															className="h-8 text-xs"
															aria-invalid={fieldState.invalid}
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>

											<Controller
												name={`medications.${index}.dosage`}
												control={form.control}
												render={({ field, fieldState }) => (
													<Field data-invalid={fieldState.invalid}>
														<FieldLabel htmlFor={field.name}>Dosage</FieldLabel>
														<Input
															{...field}
															id={field.name}
															placeholder="10mg/kg"
															className="h-8 text-xs"
															aria-invalid={fieldState.invalid}
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>

											<Controller
												name={`medications.${index}.frequency`}
												control={form.control}
												render={({ field, fieldState }) => (
													<Field data-invalid={fieldState.invalid}>
														<FieldLabel htmlFor={field.name}>
															Frequency
														</FieldLabel>
														<Input
															{...field}
															value={field.value ?? ""}
															id={field.name}
															placeholder="Twice daily"
															className="h-8 text-xs"
															aria-invalid={fieldState.invalid}
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>
										</div>

										<div className="grid grid-cols-2 gap-3">
											<Controller
												name={`medications.${index}.startDate`}
												control={form.control}
												render={({ field, fieldState }) => (
													<Field data-invalid={fieldState.invalid}>
														<FieldLabel htmlFor={field.name}>
															Start Date
														</FieldLabel>
														<Input
															type="date"
															{...field}
															value={field.value ?? ""}
															id={field.name}
															className="h-8 text-xs"
															aria-invalid={fieldState.invalid}
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>

											<Controller
												name={`medications.${index}.endDate`}
												control={form.control}
												render={({ field, fieldState }) => (
													<Field data-invalid={fieldState.invalid}>
														<FieldLabel htmlFor={field.name}>
															End Date (Optional)
														</FieldLabel>
														<Input
															type="date"
															{...field}
															value={field.value ?? ""}
															id={field.name}
															className="h-8 text-xs"
															aria-invalid={fieldState.invalid}
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>
										</div>
									</Card>
								))}
							</div>
						)}
					</div>

					<Separator className="bg-border/60" />

					{/* SECTION 3: Conditions Tags */}
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
							<ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
							Active Conditions & Allergies
						</div>

						<div className="flex gap-2">
							<Input
								placeholder="Type condition & press Enter (e.g., Flea Allergy)"
								value={conditionInput}
								onChange={(e) => setConditionInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddCondition();
									}
								}}
								className="h-9 text-xs"
							/>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={handleAddCondition}
								className="shrink-0 h-9 text-xs cursor-pointer"
							>
								Add Condition
							</Button>
						</div>

						<div className="flex flex-wrap gap-1.5 pt-1">
							{(form.watch("conditions") || []).map((condition, idx) => (
								<Badge
									key={idx}
									variant="outline"
									className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs px-2.5 py-1 gap-1.5"
								>
									{condition}
									<button
										type="button"
										onClick={() => handleRemoveCondition(idx)}
										className="text-amber-700/70 hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer"
									>
										<X className="w-3 h-3" />
									</button>
								</Badge>
							))}
						</div>
					</div>

					<Separator className="bg-border/60" />

					{/* SECTION 4: Next Checkup & Notes */}
					<div className="grid grid-cols-1 gap-4">
						<Controller
							name="nextCheckup"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel
										htmlFor={field.name}
										className="flex items-center gap-1.5 font-semibold"
									>
										<CalendarIcon className="w-3.5 h-3.5 text-sky-600" />
										Next Scheduled Checkup
									</FieldLabel>
									<Input
										type="date"
										{...field}
										value={field.value ?? ""}
										id={field.name}
										className="h-9 text-xs"
										aria-invalid={fieldState.invalid}
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>

						<Controller
							name="notes"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel
										htmlFor={field.name}
										className="flex items-center gap-1.5 font-semibold"
									>
										<FileText className="w-3.5 h-3.5 text-muted-foreground" />
										General Medical Notes
									</FieldLabel>
									<Textarea
										{...field}
										value={field.value ?? ""}
										id={field.name}
										placeholder="Enter veterinary notes or observations..."
										className="min-h-24 text-xs resize-none"
										aria-invalid={fieldState.invalid}
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
					</div>
				</form>

				{/* Footer Controls */}
				<SheetFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={isSaving}
						onClick={() => onOpenChange(false)}
						className="text-xs cursor-pointer"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="medical-record-form"
						size="sm"
						disabled={isSaving}
						className="text-xs font-medium cursor-pointer"
					>
						{isSaving ? <Loader className="w-3 h-3 mr-1 animate-spin" /> : null}
						Save
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
