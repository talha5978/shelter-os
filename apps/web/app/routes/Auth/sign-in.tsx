import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PawPrint, Eye, EyeOff, ArrowRight, Lock, Mail, Loader } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { createAuthApi } from "~/api/auth.api";
import { toast } from "sonner";

const signInSchema = z.object({
	email: z.email("Please enter a valid email").refine((val) => val.trim().length > 0, {
		message: "Email is required",
	}),
	password: z
		.string({ error: "Password is required" })
		.min(1, "Password is required")
		.refine((val) => val.trim().length > 0, {
			message: "Password is required",
		}),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export const meta = () => {
	return [
		{
			title: "Sign In | Safe Haven",
		},
	];
};

export default function SignInPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const form = useForm<SignInFormValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: SignInFormValues) => {
		setIsSubmitting(true);

		try {
			const authApi = createAuthApi();

			const result = await authApi.signIn({
				email: data.email.trim().toLowerCase(),
				password: data.password.trim(),
			});

			if (result.success) {
				toast.success("Signed in successfully");
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
			<div className="hidden lg:flex lg:w-1/2 relative bg-muted overflow-hidden">
				<img
					src="/sign_up.jpg"
					alt="Happy rescued dogs playing"
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10 flex flex-col justify-between p-12 text-white">
					<div />
					<div className="space-y-3">
						<blockquote className="text-2xl font-serif italic leading-snug">
							"Every rescue pet deserves a second chance, and every volunteer brings them one
							step closer home."
						</blockquote>
						<p className="text-sm text-white/80 font-medium">— Safe Haven Animal Shelter</p>
					</div>
				</div>
			</div>

			{/* RIGHT SIDE - Form Container */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
				<div className="w-full max-w-md space-y-8">
					{/* Header */}
					<div className="space-y-2 text-center lg:text-left">
						<div className="flex items-center justify-center lg:justify-start gap-2 mb-4 lg:hidden">
							<PawPrint className="w-7 h-7 text-primary fill-primary" />
							<span className="text-2xl font-bold tracking-tight">Safe Haven</span>
						</div>
						<h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
						<p className="text-sm text-muted-foreground">
							Sign in to manage your foster dashboard or adoption applications.
						</p>
					</div>

					{/* Form */}
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
											placeholder="alex@example.com"
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
									<div className="flex justify-between items-center">
										<FieldLabel htmlFor={field.name}>Password</FieldLabel>
										<a
											href="#"
											className="text-xs font-semibold text-primary hover:underline"
										>
											Forgot password?
										</a>
									</div>
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

						<Button
							type="submit"
							size="lg"
							className="w-full gap-2 cursor-pointer"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader className="mr-1 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								<>
									Sign In
									<ArrowRight className="w-4 h-4" />
								</>
							)}
						</Button>
					</form>

					{/* Footer Link */}
					<div className="text-center text-sm text-muted-foreground">
						Don't have an account yet?{" "}
						<Link to="/sign-up" viewTransition prefetch="intent">
							<Button variant="link" size="sm" type="button" className="p-0 font-semibold">
								Sign Up
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
