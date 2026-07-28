import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Mail, Lock, Phone, MapPin, User, Eye, EyeOff, Loader } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
} from "~/components/ui/sheet";
import { toast } from "sonner";
import { createUsersApi } from "~/api/users.api";
import { useRevalidator } from "react-router";

const addStaffSchema = z.object({
	fullName: z
		.string({ error: "Full name is required" })
		.min(2, "Full name must be at least 2 characters")
		.refine((val) => val.trim().length > 0, { message: "Full name is required" }),
	email: z.email("Please enter a valid email").refine((val) => val.trim().length > 0, {
		message: "Email is required",
	}),
	phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal("")),
	address: z.string().min(5, "Please enter a valid address").optional().or(z.literal("")),
	password: z
		.string({ error: "Password is required" })
		.min(6, "Password must be at least 6 characters")
		.refine((val) => val.trim().length > 0, { message: "Password is required" }),
});

type AddStaffFormValues = z.infer<typeof addStaffSchema>;

interface AddStaffSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function AddStaffSheet({ open, onOpenChange }: AddStaffSheetProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const revalidator = useRevalidator();

	const form = useForm<AddStaffFormValues>({
		resolver: zodResolver(addStaffSchema),
		defaultValues: {
			fullName: "",
			email: "",
			phone: "",
			address: "",
			password: "",
		},
	});

	const onSubmit = async (data: AddStaffFormValues) => {
		setIsSubmitting(true);

		try {
			const authApi = createUsersApi();

			const result = await authApi.createStaff({
				fullName: data.fullName.trim(),
				email: data.email.trim().toLowerCase(),
				phone: data.phone?.trim() || null,
				address: data.address?.trim() || null,
				password: data.password.trim(),
			});

			if (result.success) {
				toast.success("Shelter staff member added successfully");
				form.reset();
				onOpenChange(false);
				revalidator.revalidate();
			} else {
				toast.error(result.error?.message || "Failed to add staff member");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md w-full flex flex-col h-full p-0 gap-0">
				{/* Header */}
				<SheetHeader className="p-6 pb-4 border-b border-border/60">
					<div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
						<UserPlus className="w-4 h-4" />
						Staff Management
					</div>
					<SheetTitle className="text-xl">Add New Shelter Staff</SheetTitle>
					<SheetDescription>
						Create a new account for a shelter staff member. They will be able to manage animals,
						medical records, and more.
					</SheetDescription>
				</SheetHeader>

				{/* Form Body */}
				<form
					id="add-staff-form"
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex-1 overflow-y-auto p-6 space-y-5"
				>
					{/* Full Name */}
					<Controller
						name="fullName"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
								<div className="relative">
									<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
									<Input
										placeholder="Alex Rivera"
										className="pl-9"
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
									/>
								</div>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					{/* Email */}
					<Controller
						name="email"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
									<Input
										type="email"
										placeholder="staff@shelteros.com"
										className="pl-9"
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
									/>
								</div>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					{/* Phone */}
					<Controller
						name="phone"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>
									Phone Number{" "}
									<span className="text-muted-foreground font-normal">(Optional)</span>
								</FieldLabel>
								<div className="relative">
									<Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
									<Input
										type="tel"
										placeholder="+1-310-555-0101"
										className="pl-9"
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
									/>
								</div>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					{/* Address */}
					<Controller
						name="address"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>
									Address{" "}
									<span className="text-muted-foreground font-normal">(Optional)</span>
								</FieldLabel>
								<div className="relative">
									<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
									<Input
										placeholder="1245 Ocean Ave, Santa Monica, CA"
										className="pl-9"
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
									/>
								</div>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					{/* Password */}
					<Controller
						name="password"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Password</FieldLabel>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
									<Input
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
										className="pl-9 pr-9"
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>
				</form>

				{/* Footer */}
				<SheetFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="text-xs cursor-pointer"
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="add-staff-form"
						className="text-xs font-medium cursor-pointer gap-1.5"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader className="h-3.5 w-3.5 animate-spin" />
								Creating...
							</>
						) : (
							<>
								<UserPlus className="h-3.5 w-3.5" />
								Add Staff Member
							</>
						)}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
