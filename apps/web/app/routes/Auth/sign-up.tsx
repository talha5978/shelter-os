import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	PawPrint,
	Eye,
	EyeOff,
	ArrowRight,
	Lock,
	Mail,
	Loader,
	User,
	Phone,
	MapPin,
	Heart,
	Home,
	Sparkles,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Link, useLoaderData, useNavigate } from "react-router";
import { toast } from "sonner";
import { createAuthApi } from "~/api/auth.api";
import type { LoaderFunctionArgs } from "react-router";

const signUpSchema = z
	.object({
		fullName: z
			.string({ error: "Full name is required" })
			.min(2, "Full name must be at least 2 characters")
			.refine((val) => val.trim().length > 0, { message: "Full name is required" }),
		email: z.email("Please enter a valid email").refine((val) => val.trim().length > 0, {
			message: "Email is required",
		}),
		phone: z
			.string({ error: "Phone number is required" })
			.min(10, "Please enter a valid phone number")
			.refine((val) => val.trim().length > 0, { message: "Phone number is required" }),
		address: z
			.string({ error: "Address is required" })
			.min(5, "Please enter your full address")
			.refine((val) => val.trim().length > 0, { message: "Address is required" }),
		password: z
			.string({ error: "Password is required" })
			.min(6, "Password must be at least 6 characters")
			.refine((val) => val.trim().length > 0, { message: "Password is required" }),
		userRole: z.enum(["adopter", "foster"]),

		// Foster Questionnaire Fields
		fosterExperience: z.string().optional(),
		availability: z.string().optional(),
		preferredSpecies: z.string().optional(),
		housingType: z.string().optional(),
		hasKids: z.string().optional(),
		hasOtherPets: z.string().optional(),

		// Additional Foster Questions
		fosterDuration: z.string().optional(),
		hasFencedYard: z.string().optional(),
		activityLevel: z.string().optional(),
		hasSpecialNeedsExperience: z.string().optional(),
		maxAnimals: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.userRole === "foster") {
			if (!data.fosterExperience) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please select your experience background",
					path: ["fosterExperience"],
				});
			}
			if (!data.availability) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please select your foster availability",
					path: ["availability"],
				});
			}
			if (!data.preferredSpecies) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please select preferred animals",
					path: ["preferredSpecies"],
				});
			}
			if (!data.housingType) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please select your housing type",
					path: ["housingType"],
				});
			}
			if (!data.fosterDuration) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please select how long you can foster",
					path: ["fosterDuration"],
				});
			}
			if (!data.hasFencedYard) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please select if you have a fenced yard",
					path: ["hasFencedYard"],
				});
			}
			if (!data.activityLevel) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please select an activity level preference",
					path: ["activityLevel"],
				});
			}
			if (!data.hasSpecialNeedsExperience) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please select special needs experience status",
					path: ["hasSpecialNeedsExperience"],
				});
			}
			if (!data.maxAnimals) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please select maximum number of animals",
					path: ["maxAnimals"],
				});
			}
		}
	});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export const meta = () => {
	return [
		{
			title: "Sign Up | Safe Haven",
		},
	];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const isFoster = url.searchParams.get("isFoster") as string;
	return { isFoster: isFoster === "true" };
};

export default function SignUpPage() {
	const { isFoster } = useLoaderData<typeof loader>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			fullName: "",
			email: "",
			phone: "",
			address: "",
			password: "",
			userRole: isFoster ? "foster" : "adopter",
			fosterExperience: "",
			availability: "",
			preferredSpecies: "",
			housingType: "",
			hasKids: "no",
			hasOtherPets: "no",
			fosterDuration: "",
			hasFencedYard: "no",
			activityLevel: "medium",
			hasSpecialNeedsExperience: "no",
			maxAnimals: "1",
		},
	});

	const selectedRole = form.watch("userRole");

	const onSubmit = async (data: SignUpFormValues) => {
		setIsSubmitting(true);

		try {
			const authApi = createAuthApi();

			const fosterExperienceFormatted =
				data.userRole === "foster"
					? [
							`[experience:${data.fosterExperience || ""}]`,
							`[duration:${data.fosterDuration || ""}]`,
							`[species:${data.preferredSpecies || ""}]`,
							`[housing:${data.housingType || ""}]`,
							`[fencedYard:${data.hasFencedYard || ""}]`,
							`[activityLevel:${data.activityLevel || ""}]`,
							`[hasKids:${data.hasKids || ""}]`,
							`[hasOtherPets:${data.hasOtherPets || ""}]`,
							`[specialNeeds:${data.hasSpecialNeedsExperience || ""}]`,
							`[maxAnimals:${data.maxAnimals || ""}]`,
						].join("")
					: "";

			const result = await authApi.signUp({
				email: data.email.trim().toLowerCase(),
				password: data.password.trim(),
				address: data.address.trim(),
				availability: data.availability?.trim() || "",
				fullName: data.fullName.trim(),
				location: data.address.trim(),
				phone: data.phone.trim(),
				role: data.userRole === "foster" ? "foster_volunteer" : "adopter",
				fosterExperience: fosterExperienceFormatted,
			});

			if (result.success) {
				toast.success("Account created successfully");
				navigate("/");
			} else {
				toast.error(result.error?.message || "Failed to sign in. Please try again later.");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen w-full flex bg-background text-foreground">
			{/* LEFT SIDE - Full Height Image Banner */}
			<div className="hidden lg:flex lg:w-1/2 bg-muted overflow-hidden sticky top-0 h-screen">
				<img
					src="/sign_up.jpg"
					alt="Happy rescued dogs playing"
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/10 flex flex-col justify-between p-12 text-white">
					<div />
					<div className="space-y-4 max-w-lg">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
							<Sparkles className="w-3.5 h-3.5 text-primary" /> Join our community
						</div>
						<h2 className="text-3xl font-bold leading-tight">
							Start your journey to save lives today.
						</h2>
						<p className="text-sm text-white/80 leading-relaxed">
							Whether you are looking for a lifelong pet companion or offering temporary shelter
							as a foster hero, we guide you every step of the way.
						</p>
					</div>
				</div>
			</div>

			{/* RIGHT SIDE - Scrollable Form Container */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
				<div className="w-full max-w-md space-y-8 my-auto">
					{/* Header */}
					<div className="space-y-2 text-center lg:text-left">
						<div className="flex items-center justify-center lg:justify-start gap-2 mb-4 lg:hidden">
							<PawPrint className="w-7 h-7 text-primary fill-primary" />
							<span className="text-2xl font-bold tracking-tight">Safe Haven</span>
						</div>
						<h1 className="text-3xl font-bold tracking-tight">Create an Account</h1>
						<p className="text-sm text-muted-foreground">
							Join Safe Haven to start adoption applications or register as a foster volunteer.
						</p>
					</div>

					{/* Form */}
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						{/* Role Picker (Adopter vs Foster) */}
						<Controller
							name="userRole"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel className="text-base font-bold">
										What are you looking to do?
									</FieldLabel>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="grid grid-cols-2 gap-4 mt-2"
									>
										<div>
											<RadioGroupItem
												value="adopter"
												id="role-adopter"
												className="peer sr-only"
											/>
											<FieldLabel
												htmlFor="role-adopter"
												className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary  cursor-pointer text-center space-y-2 font-normal"
											>
												<Heart className="w-6 h-6 text-primary" />
												<span className="font-bold text-sm">Adopt a Pet</span>
												<span className="text-xs text-muted-foreground">
													Find a permanent family member
												</span>
											</FieldLabel>
										</div>

										<div>
											<RadioGroupItem
												value="foster"
												id="role-foster"
												className="peer sr-only"
											/>
											<FieldLabel
												htmlFor="role-foster"
												className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer text-center space-y-2 font-normal"
											>
												<Home className="w-6 h-6 text-primary" />
												<span className="font-bold text-sm">Foster Volunteer</span>
												<span className="text-xs text-muted-foreground">
													Provide temporary shelter & care
												</span>
											</FieldLabel>
										</div>
									</RadioGroup>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>

						{/* Full Name Field */}
						<Controller
							name="fullName"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
									<div className="relative">
										<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
										<Input
											type="text"
											placeholder="Sarah Martinez"
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

						{/* Email Field */}
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
											placeholder="sarah@example.com"
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

						{/* Phone Field */}
						<Controller
							name="phone"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
									<div className="relative">
										<Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
										<Input
											type="tel"
											placeholder="+1 (555) 000-0000"
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

						{/* Address Field */}
						<Controller
							name="address"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Address</FieldLabel>
									<div className="relative">
										<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
										<Input
											type="text"
											placeholder="123 Rescue St, Austin, TX"
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

						{/* Password Field */}
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

						{/* FOSTER QUESTIONNAIRE & AVAILABILITY SECTION */}
						{selectedRole === "foster" && (
							<Card className="border-primary/30 bg-primary/5 p-5 space-y-4">
								<h3 className="font-bold text-sm uppercase tracking-wide text-primary">
									Foster Qualification & Availability
								</h3>

								{/* Experience Field */}
								<Controller
									name="fosterExperience"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>
												Experience Background
											</FieldLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<SelectTrigger id={field.name} className="bg-background">
													<SelectValue placeholder="Select experience level" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="first_time">
														First-time Pet Caretaker
													</SelectItem>
													<SelectItem value="experienced_owner">
														Experienced Pet Owner
													</SelectItem>
													<SelectItem value="previous_foster">
														Previous Foster Volunteer
													</SelectItem>
													<SelectItem value="vet_professional">
														Veterinary / Shelter Staff
													</SelectItem>
												</SelectContent>
											</Select>
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>

								{/* Availability Field */}
								<Controller
									name="availability"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>Foster Availability</FieldLabel>
											<div className="relative">
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger
														id={field.name}
														className="bg-background w-full"
													>
														<SelectValue placeholder="Select availability" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="short_term">
															Short Term (1-2 weeks / Weekend respite)
														</SelectItem>
														<SelectItem value="medium_term">
															Medium Term (1-2 months)
														</SelectItem>
														<SelectItem value="long_term">
															Long Term (Until adoption)
														</SelectItem>
														<SelectItem value="emergency_only">
															Emergency / On-call Foster
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>

								{/* How long can you foster? */}
								<Controller
									name="fosterDuration"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>
												How long can you foster?
											</FieldLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<SelectTrigger id={field.name} className="bg-background">
													<SelectValue placeholder="Select foster duration" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
													<SelectItem value="1 month">1 month</SelectItem>
													<SelectItem value="2+ months">2+ months</SelectItem>
													<SelectItem value="Flexible">Flexible</SelectItem>
												</SelectContent>
											</Select>
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Preferred Species */}
									<Controller
										name="preferredSpecies"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>
													Preferred Species
												</FieldLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger id={field.name} className="bg-background">
														<SelectValue placeholder="Preferred animal" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="dogs">Dogs Only</SelectItem>
														<SelectItem value="cats">Cats Only</SelectItem>
														<SelectItem value="both">Both Dogs & Cats</SelectItem>
														<SelectItem value="small_pets">
															Small Pets / Rabbits
														</SelectItem>
													</SelectContent>
												</Select>
												{fieldState.invalid && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>

									{/* Housing Type */}
									<Controller
										name="housingType"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>Housing Type</FieldLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger id={field.name} className="bg-background">
														<SelectValue placeholder="Select housing type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="house_fenced">
															House with Fenced Yard
														</SelectItem>
														<SelectItem value="house_no_yard">
															House without Yard
														</SelectItem>
														<SelectItem value="apartment">
															Apartment / Condo
														</SelectItem>
														<SelectItem value="rural">
															Farm / Rural Property
														</SelectItem>
													</SelectContent>
												</Select>
												{fieldState.invalid && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Do you have a fenced yard? */}
									<Controller
										name="hasFencedYard"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>
													Do you have a fenced yard?
												</FieldLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger id={field.name} className="bg-background">
														<SelectValue placeholder="Select yes/no" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="yes">Yes</SelectItem>
														<SelectItem value="no">No</SelectItem>
													</SelectContent>
												</Select>
												{fieldState.invalid && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>

									{/* Activity level preference */}
									<Controller
										name="activityLevel"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>
													Activity Level Preference
												</FieldLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger id={field.name} className="bg-background">
														<SelectValue placeholder="Select activity level" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="low">
															Low (Calm / Senior)
														</SelectItem>
														<SelectItem value="medium">Medium</SelectItem>
														<SelectItem value="high">High (Energetic)</SelectItem>
													</SelectContent>
												</Select>
												{fieldState.invalid && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Kids */}
									<Controller
										name="hasKids"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>
													Children at Home?
												</FieldLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger id={field.name} className="bg-background">
														<SelectValue placeholder="Children presence" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="no">No Children</SelectItem>
														<SelectItem value="under_6">
															Yes (Under 6 years old)
														</SelectItem>
														<SelectItem value="over_6">
															Yes (6+ years old)
														</SelectItem>
													</SelectContent>
												</Select>
												{fieldState.invalid && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>

									{/* Existing Pets */}
									<Controller
										name="hasOtherPets"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>
													Existing Pets at Home?
												</FieldLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger id={field.name} className="bg-background">
														<SelectValue placeholder="Current pets" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="no">No Current Pets</SelectItem>
														<SelectItem value="dogs">Dogs Only</SelectItem>
														<SelectItem value="cats">Cats Only</SelectItem>
														<SelectItem value="both">Both Dogs & Cats</SelectItem>
													</SelectContent>
												</Select>
												{fieldState.invalid && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Special needs experience */}
									<Controller
										name="hasSpecialNeedsExperience"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>
													Special Needs Experience?
												</FieldLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger id={field.name} className="bg-background">
														<SelectValue placeholder="Select experience" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="yes">Yes</SelectItem>
														<SelectItem value="no">No</SelectItem>
													</SelectContent>
												</Select>
												{fieldState.invalid && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>

									{/* Maximum number of animals */}
									<Controller
										name="maxAnimals"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>
													Max Animals at Once
												</FieldLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger id={field.name} className="bg-background">
														<SelectValue placeholder="Select capacity" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="1">1</SelectItem>
														<SelectItem value="2">2</SelectItem>
														<SelectItem value="3+">3+</SelectItem>
													</SelectContent>
												</Select>
												{fieldState.invalid && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>
								</div>
							</Card>
						)}

						<Button
							type="submit"
							size="lg"
							className="w-full gap-2 cursor-pointer"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader className="mr-1 h-4 w-4 animate-spin" />
									Creating account...
								</>
							) : (
								<>
									Create Account
									<ArrowRight className="w-4 h-4" />
								</>
							)}
						</Button>
					</form>

					{/* Footer Link */}
					<div className="text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link to="/sign-in" viewTransition prefetch="intent">
							<Button variant="link" size="sm" type="button" className="p-0 font-semibold">
								Sign In
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
