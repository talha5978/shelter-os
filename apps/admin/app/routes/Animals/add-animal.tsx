import { Loader, X, Plus, Image as ImageIcon, Film, Save } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useState, useCallback, useRef } from "react";
import BackButton from "~/components/Nav/BackButton";
import { createMediaApi } from "~/api/media.api";
import { createApiClient } from "~/api/client";
import { createAnimalsApi } from "~/api/animals.api";
import type { MediaAsset } from "@workspace/db";

const animalSchema = z.object({
	name: z.string().min(1, "Name is required"),
	species: z.enum(["dog", "cat", "bird", "rabbit", "reptile", "other"]),
	breed: z.string().optional(),
	age: z.number().min(0, "Age must be 0 or greater").optional(),
	gender: z.enum(["male", "female", "unknown"]),
	weight: z.number().positive("Weight must be positive").optional(),
	foundLocation: z.string().min(1, "Found location is required"),
	description: z.string().optional(),
	personality: z.string().optional(),
	status: z.enum(["rescued", "intake", "medical", "foster", "adoption_ready", "adopted"]),
});

type AnimalFormData = z.infer<typeof animalSchema>;

type MediaFile = {
	file: File;
	preview: string;
	type: "image" | "video";
};

export const meta = () => {
	return [{ title: "Add Animal | ShelterOS" }];
};

export default function AddAnimal() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [images, setImages] = useState<MediaFile[]>([]);
	const [videos, setVideos] = useState<MediaFile[]>([]);

	const imageInputRef = useRef<HTMLInputElement>(null);
	const videoInputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	const form = useForm<AnimalFormData>({
		resolver: zodResolver(animalSchema),
		defaultValues: {
			name: "",
			species: "dog",
			breed: "",
			age: undefined,
			gender: "unknown",
			weight: undefined,
			foundLocation: "",
			description: "",
			personality: "",
			status: "rescued",
		},
	});

	const processFiles = (files: File[], type: "image" | "video") => {
		const validFiles = files.filter((file) =>
			type === "image" ? file.type.startsWith("image/") : file.type.startsWith("video/"),
		);

		const newMedia = validFiles.map((file) => ({
			file,
			preview: URL.createObjectURL(file),
			type,
		}));

		if (type === "image") setImages((prev) => [...prev, ...newMedia]);
		else setVideos((prev) => [...prev, ...newMedia]);
	};

	const handleMediaDrop = useCallback((e: React.DragEvent<HTMLDivElement>, type: "image" | "video") => {
		e.preventDefault();
		processFiles(Array.from(e.dataTransfer.files), type);
	}, []);

	const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
		if (e.target.files) {
			processFiles(Array.from(e.target.files), type);
			e.target.value = ""; // Reset input to allow selecting the same file again
		}
	};

	const removeMedia = (index: number, type: "image" | "video") => {
		if (type === "image") {
			URL.revokeObjectURL(images[index].preview);
			setImages((prev) => prev.filter((_, i) => i !== index));
		} else {
			URL.revokeObjectURL(videos[index].preview);
			setVideos((prev) => prev.filter((_, i) => i !== index));
		}
	};

	const onSubmit = async (data: AnimalFormData) => {
		setIsSubmitting(true);
		const client = createApiClient();
		const mediaApi = createMediaApi(client);
		let uploadedImages: MediaAsset[] = [];
		let uploadedVideos: MediaAsset[] = [];

		try {
			if (images.length > 0) {
				for (const image of images) {
					const res = await mediaApi.upload(image.file);
					if (res.success) {
						uploadedImages.push({
							url: res.data.url,
							publicId: res.data.publicId,
							dataType: "img",
						});
					} else {
						toast.error(res.error?.message || "Failed to upload image: " + image.file.name);
					}
				}
			}

			if (videos.length > 0) {
				for (const video of videos) {
					const res = await mediaApi.upload(video.file);
					if (res.success) {
						uploadedVideos.push({
							url: res.data.url,
							publicId: res.data.publicId,
							dataType: "video",
						});
					} else {
						toast.error(res.error?.message || "Failed to upload video: " + video.file.name);
					}
				}
			}

			const animalsApi = createAnimalsApi(client);
			const addResponse = await animalsApi.createAnimal({
				name: data.name.trim(),
				species: data.species,
				breed: data.breed?.trim(),
				age: data.age,
				gender: data.gender,
				weight: data.weight,
				foundLocation: data.foundLocation.trim(),
				description: data.description?.trim(),
				personality: data.personality?.trim(),
				status: data.status,
				images: uploadedImages,
				videos: uploadedVideos,
			});

			if (addResponse.success) {
				toast.success("Animal added successfully!");
				navigate("/animals");
			} else {
				toast.error(addResponse.error?.message || "Failed to add animal. Please try again.");
				if (uploadedImages.length > 0) {
					for (const image of uploadedImages) {
						await mediaApi.delete(image.publicId);
					}
				}
				if (uploadedVideos.length > 0) {
					for (const video of uploadedVideos) {
						await mediaApi.delete(video.publicId);
					}
				}
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
			console.error(error);
			if (uploadedImages.length > 0) {
				for (const image of uploadedImages) {
					await mediaApi.delete(image.publicId);
				}
			}
			if (uploadedVideos.length > 0) {
				for (const video of uploadedVideos) {
					await mediaApi.delete(video.publicId);
				}
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="w-full p-6 md:p-8 space-y-8 bg-muted/20 min-h-screen">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<BackButton href={"/animals"} />
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Intake</h1>
						<p className="text-muted-foreground mt-1 text-sm">
							Register a newly rescued animal into the shelter system.
						</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Button variant="outline" type="button" onClick={() => navigate(-1)}>
						Cancel
					</Button>
					<Button
						type="submit"
						form="animal-intake-form"
						disabled={isSubmitting}
						className="min-w-35"
					>
						{isSubmitting ? (
							<Loader className="mr-1 h-4 w-4 animate-spin" />
						) : (
							<Save className="mr-1 h-4 w-4" />
						)}
						Save Record
					</Button>
				</div>
			</div>

			{/* Main Form Layout */}
			<form
				id="animal-intake-form"
				onSubmit={form.handleSubmit(onSubmit)}
				className="grid grid-cols-1 xl:grid-cols-3 gap-8"
			>
				{/* Left Column: Form Fields */}
				<div className="xl:col-span-2 space-y-8">
					{/* Basic Information Card */}
					<Card className="shadow-sm border-border/50">
						<CardHeader className="pb-4 border-b border-border/50 mb-6">
							<CardTitle className="text-lg">Basic Information</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<Controller
								name="name"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>Animal Name</FieldLabel>
										<Input placeholder="e.g. Buddy" {...field} />
										<FieldError errors={[fieldState.error]} />
									</Field>
								)}
							/>

							<Controller
								name="species"
								control={form.control}
								render={({ field }) => (
									<Field>
										<FieldLabel>Species</FieldLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{["dog", "cat", "bird", "rabbit", "reptile", "other"].map(
													(s) => (
														<SelectItem key={s} value={s}>
															{s.charAt(0).toUpperCase() + s.slice(1)}
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
									</Field>
								)}
							/>

							<Controller
								name="breed"
								control={form.control}
								render={({ field }) => (
									<Field>
										<FieldLabel>Breed (Optional)</FieldLabel>
										<Input placeholder="e.g. German Shepherd" {...field} />
									</Field>
								)}
							/>

							<Controller
								name="gender"
								control={form.control}
								render={({ field }) => (
									<Field>
										<FieldLabel>Gender</FieldLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">Female</SelectItem>
												<SelectItem value="unknown">Unknown</SelectItem>
											</SelectContent>
										</Select>
									</Field>
								)}
							/>

							<Controller
								name="age"
								control={form.control}
								render={({ field }) => (
									<Field>
										<FieldLabel>Age (years)</FieldLabel>
										<Input
											type="number"
											step="0.01"
											placeholder="e.g. 2"
											{...field}
											onChange={(e) =>
												field.onChange(
													e.target.value ? Number(e.target.value) : undefined,
												)
											}
										/>
									</Field>
								)}
							/>

							<Controller
								name="weight"
								control={form.control}
								render={({ field }) => (
									<Field>
										<FieldLabel>Weight (kg)</FieldLabel>
										<Input
											type="number"
											step="0.1"
											placeholder="e.g. 12.5"
											{...field}
											onChange={(e) =>
												field.onChange(
													e.target.value ? Number(e.target.value) : undefined,
												)
											}
										/>
									</Field>
								)}
							/>

							<Controller
								name="foundLocation"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field
										data-invalid={fieldState.invalid}
										className="md:col-span-2 lg:col-span-3"
									>
										<FieldLabel>Found Location</FieldLabel>
										<Input placeholder="e.g. Main Street near Central Park" {...field} />
										<FieldError errors={[fieldState.error]} />
									</Field>
								)}
							/>
						</CardContent>
					</Card>

					{/* Assessment & Details Card */}
					<Card className="shadow-sm border-border/50">
						<CardHeader className="pb-4 border-b border-border/50 mb-6">
							<CardTitle className="text-lg">Assessment & Details</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Controller
								name="description"
								control={form.control}
								render={({ field }) => (
									<Field>
										<FieldLabel>General Description</FieldLabel>
										<Textarea
											placeholder="Describe physical appearance, distinguishing marks, condition when found..."
											className="resize-none min-h-45"
											{...field}
										/>
									</Field>
								)}
							/>

							<Controller
								name="personality"
								control={form.control}
								render={({ field }) => (
									<Field>
										<FieldLabel>Personality / Behavior</FieldLabel>
										<Textarea
											placeholder="Friendly, timid, aggressive towards other dogs, good with kids..."
											className="resize-none min-h-45"
											{...field}
										/>
									</Field>
								)}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Right Column: Media Uploads */}
				<div className="space-y-8">
					<Card className="shadow-sm border-border/50">
						<CardHeader className="pb-4 border-b border-border/50 mb-6">
							<CardTitle className="text-lg">Media Gallery</CardTitle>
							<CardDescription>Upload clear photos and videos for the profile.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-8">
							{/* Images Section */}
							<div>
								<div className="mb-3 flex items-center gap-2 text-sm font-medium">
									<ImageIcon className="w-4 h-4 text-muted-foreground" />
									<span>Images</span>
								</div>
								<input
									type="file"
									accept="image/*"
									multiple
									className="hidden"
									ref={imageInputRef}
									onChange={(e) => handleMediaSelect(e, "image")}
								/>
								<div
									className="grid grid-cols-3 gap-3"
									onDragOver={(e) => e.preventDefault()}
									onDrop={(e) => handleMediaDrop(e, "image")}
								>
									{/* Add Image Card */}
									<div
										onClick={() => imageInputRef.current?.click()}
										className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-xl bg-muted/10 hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer group "
									>
										<div className="p-2 rounded-full bg-background shadow-sm group-hover:scale-110 transition-transform">
											<Plus className="w-5 h-5 text-primary" />
										</div>
									</div>

									{/* Image Previews */}
									{images.map((img, i) => (
										<div key={`img-${i}`} className="relative group aspect-square">
											<img
												src={img.preview}
												alt="Preview"
												className="w-full h-full object-cover rounded-xl border border-border"
											/>
											<Button
												type="button"
												size={"icon-xs"}
												onClick={() => removeMedia(i, "image")}
												className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full"
											>
												<X size={14} strokeWidth={3} />
											</Button>
										</div>
									))}
								</div>
							</div>

							{/* Videos Section */}
							<div>
								<div className="flex items-center gap-2 mb-3 text-sm font-medium">
									<Film className="w-4 h-4 text-muted-foreground" />
									<span>Videos</span>
								</div>
								<input
									type="file"
									accept="video/*"
									multiple
									className="hidden"
									ref={videoInputRef}
									onChange={(e) => handleMediaSelect(e, "video")}
								/>
								<div
									className="grid grid-cols-3 gap-3"
									onDragOver={(e) => e.preventDefault()}
									onDrop={(e) => handleMediaDrop(e, "video")}
								>
									{/* Add Video Card */}
									<div
										onClick={() => videoInputRef.current?.click()}
										className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-xl bg-muted/10 hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer group"
									>
										<div className="p-2 rounded-full bg-background shadow-sm group-hover:scale-110 transition-transform">
											<Plus className="w-5 h-5 text-primary" />
										</div>
									</div>

									{/* Video Previews */}
									{videos.map((vid, i) => (
										<div key={`vid-${i}`} className="relative group aspect-square">
											<video
												src={vid.preview}
												className="w-full h-full object-cover rounded-xl border border-border bg-black"
											/>
											<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
												<div className="bg-black/90 rounded-full p-1.5 backdrop-blur-sm">
													<Film className="w-4 h-4 text-white" />
												</div>
											</div>
											<Button
												type="button"
												size={"icon-xs"}
												onClick={() => removeMedia(i, "video")}
												className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full"
											>
												<X size={14} strokeWidth={3} />
											</Button>
										</div>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</form>
		</div>
	);
}
