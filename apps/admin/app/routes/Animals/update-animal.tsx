import { Loader, X, Plus, Image as ImageIcon, Film, Save, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useLoaderData, useNavigate } from "react-router";
import { toast } from "sonner";
import { useState, useCallback, useRef } from "react";
import BackButton from "~/components/Nav/BackButton";
import { createMediaApi } from "~/api/media.api";
import { createApiClient } from "~/api/client";
import { createAnimalsApi } from "~/api/animals.api";
import type { MediaAsset } from "@workspace/db";
import type { LoaderFunctionArgs } from "react-router";
import { invalidateCache } from "~/utils/invalidate";

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

// Extended MediaFile type to support both newly uploaded files and prefilled Cloudinary assets
type MediaItem = {
	file?: File;
	preview: string;
	type: "image" | "video";
	publicId?: string;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	if (!params.animalId) {
		throw new Response("Animal ID is required", { status: 400 });
	}

	const cookieHeader = request.headers.get("Cookie") ?? "";
	const client = createApiClient();
	client.setCookie(cookieHeader);

	const animalsApi = createAnimalsApi(client);

	const data = await animalsApi.getAnimalForUpdate(params.animalId as string);

	return { data, animalId: params.animalId as string };
};

export const meta = () => {
	return [{ title: "Edit Animal | ShelterOS" }];
};

export default function EditAnimalProfile() {
	const loaderData = useLoaderData<typeof loader>();
	const animal = loaderData.data.success ? loaderData.data.data.animal : null;

	if (!loaderData.data.success) {
		const error = loaderData.data.error;
		return (
			<div className="flex h-[70vh] items-center justify-center p-6">
				<div className="max-w-md w-full text-center">
					<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="h-10 w-10 text-destructive" />
					</div>
					<h2 className="text-2xl font-semibold tracking-tight mb-2">
						Failed to load animal profile
					</h2>
					<p className="text-muted-foreground mb-6">
						{error?.message || "Something went wrong while retrieving animal records."}
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button
							onClick={() => invalidateCache(`animal-update:${loaderData.animalId}`)}
							variant="default"
						>
							<RefreshCw className="mr-2 h-4 w-4" />
							Retry
						</Button>
						<Button variant="outline" asChild>
							<Link to="/">Go to Dashboard</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize state with existing prefilled images and videos from the animal record
	const [images, setImages] = useState<MediaItem[]>(() => {
		if (!animal?.photos) return [];
		return ((animal.photos as MediaAsset[]) || []).map((img: MediaAsset) => ({
			preview: img.url,
			type: "image",
			publicId: img.publicId,
		}));
	});

	const [videos, setVideos] = useState<MediaItem[]>(() => {
		if (!animal?.videos) return [];
		return ((animal.videos as MediaAsset[]) || []).map((vid: MediaAsset) => ({
			preview: vid.url,
			type: "video",
			publicId: vid.publicId,
		}));
	});

	// Track public IDs of existing assets deleted by the user so we can clean them up on Cloudinary
	const [deletedPublicIds, setDeletedPublicIds] = useState<string[]>([]);

	const imageInputRef = useRef<HTMLInputElement>(null);
	const videoInputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	const form = useForm<AnimalFormData>({
		resolver: zodResolver(animalSchema),
		defaultValues: {
			name: animal?.name || "",
			species: animal?.species || "dog",
			breed: animal?.breed || "",
			age: animal?.age ? parseFloat(animal.age) : undefined,
			gender: animal?.gender || "unknown",
			weight: animal?.weight ? parseFloat(animal.weight) : undefined,
			foundLocation: animal?.foundLocation || "",
			description: animal?.description || "",
			personality: animal?.personality || "",
			status: animal?.status || "rescued",
		},
	});

	const processFiles = (files: File[], type: "image" | "video") => {
		const validFiles = files.filter((file) =>
			type === "image" ? file.type.startsWith("image/") : file.type.startsWith("video/"),
		);

		const newMedia: MediaItem[] = validFiles.map((file) => ({
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
			const itemToRemove = images[index];
			if (itemToRemove.publicId) {
				// Track existing Cloudinary asset to delete upon submit
				setDeletedPublicIds((prev) => [...prev, itemToRemove.publicId!]);
			} else if (itemToRemove.file) {
				// Revoke local object URL for newly added files
				URL.revokeObjectURL(itemToRemove.preview);
			}
			setImages((prev) => prev.filter((_, i) => i !== index));
		} else {
			const itemToRemove = videos[index];
			if (itemToRemove.publicId) {
				// Track existing Cloudinary asset to delete upon submit
				setDeletedPublicIds((prev) => [...prev, itemToRemove.publicId!]);
			} else if (itemToRemove.file) {
				// Revoke local object URL for newly added files
				URL.revokeObjectURL(itemToRemove.preview);
			}
			setVideos((prev) => prev.filter((_, i) => i !== index));
		}
	};

	const onSubmit = async (data: AnimalFormData) => {
		setIsSubmitting(true);
		const client = createApiClient();
		const mediaApi = createMediaApi(client);
		let newlyUploadedImages: MediaAsset[] = [];
		let newlyUploadedVideos: MediaAsset[] = [];

		try {
			// Delete removed Cloudinary media assets
			if (deletedPublicIds.length > 0) {
				for (const publicId of deletedPublicIds) {
					await mediaApi.delete(publicId);
				}
			}

			// Upload only NEW image files
			for (const item of images) {
				if (item.file) {
					const res = await mediaApi.upload(item.file);
					if (res.success) {
						newlyUploadedImages.push({
							url: res.data.url,
							publicId: res.data.publicId,
							dataType: "img",
						});
					} else {
						toast.error(res.error?.message || "Failed to upload image: " + item.file.name);
					}
				}
			}

			// Upload only NEW video files
			for (const item of videos) {
				if (item.file) {
					const res = await mediaApi.upload(item.file);
					if (res.success) {
						newlyUploadedVideos.push({
							url: res.data.url,
							publicId: res.data.publicId,
							dataType: "video",
						});
					} else {
						toast.error(res.error?.message || "Failed to upload video: " + item.file.name);
					}
				}
			}

			// Combine existing remaining media with newly uploaded media
			const existingImages: MediaAsset[] = images
				.filter((item) => !item.file && item.publicId)
				.map((item) => ({
					url: item.preview,
					publicId: item.publicId!,
					dataType: "img",
				}));

			const existingVideos: MediaAsset[] = videos
				.filter((item) => !item.file && item.publicId)
				.map((item) => ({
					url: item.preview,
					publicId: item.publicId!,
					dataType: "video",
				}));

			const finalImages = [...existingImages, ...newlyUploadedImages];
			const finalVideos = [...existingVideos, ...newlyUploadedVideos];

			//  Submit update request
			const animalsApi = createAnimalsApi(client);
			const updateResponse = await animalsApi.updateAnimal(loaderData.animalId, {
				name: data.name.trim() === animal?.name ? undefined : data.name.trim(),
				species: data.species === animal?.species ? undefined : data.species,
				breed: data.breed?.trim() === animal?.breed ? undefined : data.breed?.trim(),
				age: data.age === animal?.age ? undefined : data.age,
				gender: data.gender === animal?.gender ? undefined : data.gender,
				weight: data.weight === animal?.weight ? undefined : data.weight,
				foundLocation:
					data.foundLocation.trim() === animal?.foundLocation
						? undefined
						: data.foundLocation.trim(),
				description:
					data.description?.trim() === animal?.description ? undefined : data.description?.trim(),
				personality:
					data.personality?.trim() === animal?.personality ? undefined : data.personality?.trim(),
				status: data.status === animal?.status ? undefined : data.status,
				images: finalImages,
				videos: finalVideos,
			});

			if (updateResponse.success) {
				toast.success("Animal updated successfully!");
				navigate(-1);
			} else {
				toast.error(updateResponse.error?.message || "Failed to update animal. Please try again.");
				// Rollback newly uploaded files if backend request fails
				if (newlyUploadedImages.length > 0) {
					for (const image of newlyUploadedImages) {
						await mediaApi.delete(image.publicId);
					}
				}
				if (newlyUploadedVideos.length > 0) {
					for (const video of newlyUploadedVideos) {
						await mediaApi.delete(video.publicId);
					}
				}
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
			console.error(error);
			if (newlyUploadedImages.length > 0) {
				for (const image of newlyUploadedImages) {
					await mediaApi.delete(image.publicId);
				}
			}
			if (newlyUploadedVideos.length > 0) {
				for (const video of newlyUploadedVideos) {
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
						<h1 className="text-3xl font-bold tracking-tight text-foreground">
							Edit Animal Profile
						</h1>
						<p className="text-muted-foreground mt-1 text-sm">
							Update profile records and media details.
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
						Save Changes
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
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
							</div>
							<div className="flex md:flex-row gap-6 mt-6 *:flex-1 flex-col">
								<Controller
									name="status"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field
											data-invalid={fieldState.invalid}
											className="md:col-span-2 lg:col-span-3"
										>
											<FieldLabel>Status</FieldLabel>
											<Select onValueChange={field.onChange} value={field.value}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="rescued">Rescued</SelectItem>
													<SelectItem value="intake">Intake</SelectItem>
													<SelectItem value="medical">Medical</SelectItem>
													<SelectItem value="foster">Foster Ready</SelectItem>
													<SelectItem value="adoption_ready">
														Adoption Ready
													</SelectItem>
													<SelectItem value="adopted">Adopted</SelectItem>
												</SelectContent>
											</Select>
											<FieldError errors={[fieldState.error]} />
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
											<Input
												placeholder="e.g. Main Street near Central Park"
												{...field}
											/>
											<FieldError errors={[fieldState.error]} />
										</Field>
									)}
								/>
							</div>
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
