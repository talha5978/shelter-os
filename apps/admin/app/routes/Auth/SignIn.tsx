import { Eye, EyeOff, Loader, LogIn } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useState } from "react";
import { createAuthApi } from "~/api/auth.api";

export const meta = () => {
	return [{ title: "Sign In | Admin" }];
};

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

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const form = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: SignInFormData) => {
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
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md shadow-sm border border-border">
				<CardHeader className="space-y-3 text-center">
					<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
						<LogIn className="w-6 h-6 text-primary" />
					</div>
					<CardTitle className="text-2xl font-semibold tracking-tight">Sign In</CardTitle>
					<CardDescription>Enter your credentials to access the admin panel</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						<Controller
							name="email"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
									<Input
										type="email"
										placeholder="admin@gmail.com"
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Controller
							name="password"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Password</FieldLabel>
									<div className="relative">
										<Input
											type={showPassword ? "text" : "password"}
											placeholder="••••••••"
											className="pr-8"
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
										/>
										<button
											type="button"
											className="cursor-pointer"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<Eye className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2" />
											) : (
												<EyeOff className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2" />
											)}
										</button>
									</div>

									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
							Sign In
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
