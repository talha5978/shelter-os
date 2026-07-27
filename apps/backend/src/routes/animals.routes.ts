import {
	animalMedicalRecords,
	animals,
	animalTimeline,
	type AnimalStatus,
	type Gender,
	type MediaAsset,
	type Species,
	type Vaccine,
} from "@workspace/db";
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { adminAuthMiddleware, publicAuthMiddleware, requireRole } from "~/middlewares/auth.middleware";
import { ApiError } from "~/utils/ApiError";

export async function animalsRoutes(fastify: FastifyInstance) {
	/** Add a new animal */
	fastify.post(
		"/",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const userId = request.user?.id as string;

			const {
				name,
				species,
				breed,
				age,
				gender,
				weight,
				foundLocation,
				description,
				personality,
				status: inputStatus,
				images: photos = [],
				videos = [],
			} = request.body as {
				name?: string;
				species: Species;
				breed?: string;
				age?: number;
				gender: Gender;
				weight?: number;
				foundLocation: string;
				description?: string;
				personality?: string;
				status: AnimalStatus;
				images?: MediaAsset[];
				videos?: MediaAsset[];
			};

			const status = inputStatus || "rescued";

			// Generate unique Animal ID (e.g., DOG-1024)
			const animalId = `${species.toUpperCase()}-${Date.now().toString().slice(-7)}`;

			const [newAnimal] = await fastify.db
				.insert(animals)
				.values({
					animalId,
					name: name || null,
					species,
					breed: breed || null,
					age: age ? String(age) : null,
					gender,
					weight: weight ? String(weight) : null,
					foundLocation,
					intakeDate: status === "intake" ? new Date() : null,
					status: status,
					description: description || null,
					personality: personality || null,
					photos,
					videos,
					createdBy: userId,
					rescueDate: status === "rescued" ? new Date() : null,
				})
				.returning();

			if (!newAnimal) {
				throw new ApiError("Failed to add animal to shelter", 500);
			}

			return reply.success({ animal: newAnimal }, "Animal successfully added to shelter!", 201);
		},
	);

	/** Update an existing animal profile */
	fastify.put(
		"/:id",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { id } = request.params as { id: string };

			const [existingAnimal] = await fastify.db
				.select()
				.from(animals)
				.where(eq(animals.id, id))
				.limit(1);

			if (!existingAnimal) {
				throw new ApiError("Animal record not found", 404);
			}

			const {
				name,
				species,
				breed,
				age,
				gender,
				weight,
				foundLocation,
				description,
				personality,
				status,
				images: photos,
				videos,
			} = request.body as {
				name?: string;
				species?: Species;
				breed?: string;
				age?: number;
				gender?: Gender;
				weight?: number;
				foundLocation?: string;
				description?: string;
				personality?: string;
				status?: AnimalStatus;
				images?: MediaAsset[];
				videos?: MediaAsset[];
			};

			const [updatedAnimal] = await fastify.db
				.update(animals)
				.set({
					...(name !== undefined && { name: name.trim() || null }),
					...(species !== undefined && { species }),
					...(breed !== undefined && { breed: breed.trim() || null }),
					...(age !== undefined && { age: age ? String(age) : null }),
					...(gender !== undefined && { gender }),
					...(weight !== undefined && { weight: weight ? String(weight) : null }),
					...(foundLocation !== undefined && { foundLocation: foundLocation.trim() }),
					...(description !== undefined && { description: description.trim() || null }),
					...(personality !== undefined && { personality: personality.trim() || null }),
					...(status !== undefined && { status }),
					...(photos !== undefined && { photos }),
					...(videos !== undefined && { videos }),
					updatedAt: new Date(),
				})
				.where(eq(animals.id, id))
				.returning();

			if (!updatedAnimal) {
				throw new ApiError("Failed to update animal record", 500);
			}

			return reply.success({ animal: updatedAnimal }, "Animal record updated successfully");
		},
	);

	/** Get all animals for dashboard */
	fastify.get(
		"/",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			let {
				pageIndex: rPageIndex = "0",
				pageSize = "12",
				search = "",
			} = request.query as {
				pageIndex?: string;
				pageSize?: string;
				search?: string;
			};

			const pageIndex = Math.max(1, parseInt(rPageIndex));
			const limit = Math.min(50, parseInt(pageSize));
			const offset = (pageIndex - 1) * limit;

			// Build search condition
			const searchCondition = search.trim()
				? or(
						ilike(animals.name, `%${search}%`),
						ilike(animals.animalId, `%${search}%`),
						ilike(animals.foundLocation, `%${search}%`),
						ilike(animals.description, `%${search}%`),
					)
				: undefined;

			// Get total count for pagination
			const [{ count: total }] = await fastify.db
				.select({ count: count() })
				.from(animals)
				.where(searchCondition);

			// Fetch animals with selected fields
			const animalList = await fastify.db
				.select({
					id: animals.id,
					animalId: animals.animalId,
					name: animals.name,
					species: animals.species,
					breed: animals.breed,
					age: sql<number>`${animals.age}::numeric`,
					gender: animals.gender,
					status: animals.status,
					description: animals.description,
					photos: animals.photos,
				})
				.from(animals)
				.where(searchCondition)
				.orderBy(desc(animals.createdAt))
				.limit(limit)
				.offset(offset);

			const totalPages = Math.ceil(Number(total) / limit);

			return reply.success({
				animals: animalList,
				pagination: {
					page: pageIndex,
					pageSize: limit,
					total: Number(total),
					totalPages,
					hasNext: pageIndex < totalPages,
					hasPrev: pageIndex > 1,
				},
			});
		},
	);

	/** Create an animal's medical record */
	fastify.post(
		"/:animalId/medical",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const userId = request.user?.id as string;
			const { animalId } = request.params as { animalId: string };

			if (!animalId) {
				throw new ApiError("Animal id is missing", 400, "ANIMAL_ID_REQUIRED");
			}

			const {
				vaccines = [],
				medications = [],
				conditions = [],
				nextCheckup,
				notes,
			} = request.body as {
				vaccines?: Vaccine[];
				medications?: any[];
				conditions?: string[];
				nextCheckup?: string | Date | null;
				notes?: string | null;
			};

			const animal = await fastify.db.query.animals.findFirst({
				where: eq(animals.id, animalId),
			});

			if (!animal) {
				throw new ApiError("Animal not found", 404, "ANIMAL_NOT_FOUND");
			}

			const [newRecord] = await fastify.db
				.insert(animalMedicalRecords)
				.values({
					animalId,
					vaccines: vaccines || [],
					medications: medications || [],
					conditions: conditions || [],
					nextCheckup: nextCheckup ? new Date(nextCheckup) : null,
					notes: notes || null,
					createdBy: userId,
				})
				.returning();

			return reply.success({ medicalRecord: newRecord }, "Medical record created successfully", 201);
		},
	);

	/** Get an animal's medical record */
	fastify.get(
		"/:animalId/medical",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { animalId } = request.params as { animalId: string };

			if (!animalId) {
				throw new ApiError("Animal id is missing", 400, "ANIMAL_ID_REQUIRED");
			}

			const [animal] = await fastify.db
				.select({
					id: animals.id,
					name: animals.name,
					animalId: animals.animalId,
				})
				.from(animals)
				.where(eq(animals.id, animalId))
				.limit(1);

			if (!animal) {
				throw new ApiError("Animal not found", 400);
			}

			const records = await fastify.db
				.select()
				.from(animalMedicalRecords)
				.where(eq(animalMedicalRecords.animalId, animalId))
				.orderBy(desc(animalMedicalRecords.createdAt))
				.limit(20);

			return reply.success(
				{
					records,
					animal: {
						id: animal.id,
						name: animal.name,
						animalId: animal.animalId,
					},
				},
				"Medical record fetched successfully",
				201,
			);
		},
	);

	/** Get animals record for main medical route */
	fastify.get(
		"/medical",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const {
				pageIndex: rPageIndex = "1",
				pageSize = "12",
				search = "",
			} = request.query as {
				pageIndex?: string;
				pageSize?: string;
				search?: string;
			};

			const pageIndex = Math.max(1, parseInt(rPageIndex));
			const limit = Math.min(50, parseInt(pageSize));
			const offset = (pageIndex - 1) * limit;

			const searchCondition = search.trim()
				? or(ilike(animals.name, `%${search}%`), ilike(animals.animalId, `%${search}%`))
				: undefined;

			// Get total count of animals that have medical records
			const [{ count: total }] = await fastify.db
				.select({ count: count() })
				.from(animals)
				.innerJoin(animalMedicalRecords, eq(animals.id, animalMedicalRecords.animalId))
				.where(searchCondition);

			const results = await fastify.db
				.select({
					id: animals.id,
					animalId: animals.animalId,
					name: animals.name,
					photos: animals.photos,
					species: animals.species,
					nextCheckup: animalMedicalRecords.nextCheckup,
					conditions: animalMedicalRecords.conditions,
					recordId: animalMedicalRecords.id,
					updatedAt: animalMedicalRecords.updatedAt,
				})
				.from(animals)
				.innerJoin(animalMedicalRecords, eq(animals.id, animalMedicalRecords.animalId))
				.where(searchCondition)
				.orderBy(desc(animalMedicalRecords.updatedAt))
				.limit(limit)
				.offset(offset);

			const now = new Date();
			const animalsWithMedical = results.map((item) => {
				const conditions = item.conditions || [];
				const nextCheckup = item.nextCheckup ? new Date(item.nextCheckup) : null;

				let checkupStatus: "overdue" | "upcoming" | "none" = "none";
				if (nextCheckup) {
					if (nextCheckup < now) {
						checkupStatus = "overdue";
					} else {
						checkupStatus = "upcoming";
					}
				}

				return {
					id: item.id,
					animalId: item.animalId,
					name: item.name,
					photos: item.photos,
					species: item.species,
					nextCheckup: item.nextCheckup,
					activeConditions: conditions, // take all for now, or conditions[0] if you only want the first
					conditionsCount: conditions.length,
					checkupStatus,
					updatedAt: item.updatedAt,
				};
			});

			// Summary stats
			const overdueCount = animalsWithMedical.filter((a) => a.checkupStatus === "overdue").length;
			const upcomingCount = animalsWithMedical.filter((a) => a.checkupStatus === "upcoming").length;

			const totalPages = Math.ceil(Number(total) / limit);

			return reply.success(
				{
					animals: animalsWithMedical,
					stats: {
						total: Number(total),
						overdue: overdueCount,
						upcoming: upcomingCount,
					},
					pagination: {
						page: pageIndex,
						pageSize: limit,
						total: Number(total),
						totalPages,
						hasNext: pageIndex < totalPages,
						hasPrev: pageIndex > 1,
					},
				},
				"Medical records fetched successfully",
			);
		},
	);

	/** Add timeline entry for an animal */
	fastify.post(
		"/:animalId/timeline",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const userId = request.user?.id as string;
			const { animalId } = request.params as { animalId: string };

			const {
				eventType,
				description,
				eventDate,
				metadata = {},
			} = request.body as {
				eventType: string;
				description: string;
				eventDate: string;
				metadata?: unknown;
			};

			if (!animalId) {
				throw new ApiError("Animal ID is required", 400, "ANIMAL_ID_REQUIRED");
			}

			if (!eventType || !description) {
				throw new ApiError("eventType and description are required", 400, "MISSING_FIELDS");
			}

			const animal = await fastify.db.query.animals.findFirst({
				where: eq(animals.id, animalId),
				columns: {
					id: true,
					name: true,
					animalId: true,
				},
			});

			if (!animal) {
				throw new ApiError("Animal not found", 404, "ANIMAL_NOT_FOUND");
			}

			// Create timeline entry
			const [newTimeline] = await fastify.db
				.insert(animalTimeline)
				.values({
					animalId,
					eventType,
					description,
					eventDate: eventDate ? new Date(eventDate) : new Date(),
					createdBy: userId,
					metadata: metadata || {},
				})
				.returning();

			return reply.success(
				{
					timeline: newTimeline,
					animal,
				},
				"Timeline entry added successfully",
				201,
			);
		},
	);

	/** Get an animal's full timeline */
	fastify.get(
		"/:animalId/timeline",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { animalId } = request.params as { animalId: string };

			if (!animalId) {
				throw new ApiError("Animal id is missing", 400, "ANIMAL_ID_REQUIRED");
			}

			const [animal] = await fastify.db
				.select({
					id: animals.id,
					name: animals.name,
					animalId: animals.animalId,
				})
				.from(animals)
				.where(eq(animals.id, animalId))
				.limit(1);

			if (!animal) {
				throw new ApiError("Animal not found", 400);
			}

			const timeline = await fastify.db
				.select()
				.from(animalTimeline)
				.where(eq(animalTimeline.animalId, animalId))
				.orderBy(asc(animalTimeline.eventDate))
				.limit(20);

			return reply.success(
				{
					timeline,
					animal: {
						id: animal.id,
						name: animal.name,
						animalId: animal.animalId,
					},
				},
				"Timeline history fetched successfully",
				200,
			);
		},
	);

	/** Get animal basic profile data for update */
	fastify.get(
		"/:animalId/update-profile",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { animalId } = request.params as { animalId: string };

			if (!animalId) {
				throw new ApiError("Animal ID is required", 400, "ANIMAL_ID_REQUIRED");
			}

			const [animal] = await fastify.db
				.select({
					id: animals.id,
					name: animals.name,
					animalId: animals.animalId,
					breed: animals.breed,
					gender: animals.gender,
					age: sql<number>`${animals.age}::numeric`,
					weight: sql<number>`${animals.weight}::numeric`,
					foundLocation: animals.foundLocation,
					description: animals.description,
					personality: animals.personality,
					status: animals.status,
					photos: animals.photos,
					videos: animals.videos,
					createdBy: animals.createdBy,
				})
				.from(animals)
				.where(eq(animals.id, animalId))
				.limit(1);

			if (!animal) {
				throw new ApiError("Animal not found", 404, "ANIMAL_NOT_FOUND");
			}

			return reply.success({ animal }, "Animal data fetched successfully");
		},
	);

	/** Get animals to foster */
	fastify.get(
		"/public",
		{
			preHandler: [publicAuthMiddleware, requireRole(["foster_volunteer", "adopter"])],
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const {
				pageIndex: rPageIndex = "1",
				pageSize = "12",
				search = "",
				species,
			} = request.query as {
				pageIndex?: string;
				pageSize?: string;
				search?: string;
				species?: string;
			};

			const pageIndex = Math.max(1, parseInt(rPageIndex));
			const limit = Math.min(50, parseInt(pageSize));
			const offset = (pageIndex - 1) * limit;

			// Base condition: only animals with status = 'foster'
			const conditions = [
				eq(animals.status, request.user!.role === "foster_volunteer" ? "foster" : "adoption_ready"),
			];

			// Optional search
			if (search.trim()) {
				conditions.push(
					or(
						ilike(animals.name, `%${search}%`),
						ilike(animals.breed, `%${search}%`),
						ilike(animals.animalId, `%${search}%`),
						ilike(animals.description, `%${search}%`),
					)!,
				);
			}

			// Optional species filter
			if (species && species !== "all") {
				conditions.push(eq(animals.species, species as any));
			}

			// Total count
			const [{ count: total }] = await fastify.db
				.select({ count: count() })
				.from(animals)
				.where(and(...conditions));

			// Fetch animals
			const fosterableAnimals = await fastify.db
				.select({
					id: animals.id,
					animalId: animals.animalId,
					name: animals.name,
					species: animals.species,
					breed: animals.breed,
					age: animals.age,
					gender: animals.gender,
					weight: animals.weight,
					description: animals.description,
					personality: animals.personality,
					photos: animals.photos,
					status: animals.status,
					createdAt: animals.createdAt,
				})
				.from(animals)
				.where(and(...conditions))
				.orderBy(desc(animals.createdAt))
				.limit(limit)
				.offset(offset);

			const totalPages = Math.ceil(Number(total) / limit);

			return reply.success(
				{
					animals: fosterableAnimals,
					pagination: {
						page: pageIndex,
						pageSize: limit,
						total: Number(total),
						totalPages,
						hasNext: pageIndex < totalPages,
						hasPrev: pageIndex > 1,
					},
				},
				"Fosterable animals fetched successfully",
			);
		},
	);
}
