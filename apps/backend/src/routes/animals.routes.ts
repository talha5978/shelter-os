import {
	adoptions,
	animalMedicalRecords,
	animals,
	animalTimeline,
	fosters,
	users,
	type AnimalStatus,
	type Gender,
	type MediaAsset,
	type Species,
	type Vaccine,
} from "@workspace/db";
import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GeminiService } from "~/lib/gemini";
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
					species: animals.species,
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

	/** Get animals for public */
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

	/** Get animal public profile */
	fastify.get("/:animalId/public-profile", async (request: FastifyRequest, reply: FastifyReply) => {
		const { animalId } = request.params as { animalId: string };

		if (!animalId) {
			throw new ApiError("Animal ID is required", 400, "ANIMAL_ID_REQUIRED");
		}

		// 1. Get basic animal info
		const animal = await fastify.db.query.animals.findFirst({
			where: eq(animals.id, animalId),
			columns: {
				id: true,
				animalId: true,
				name: true,
				species: true,
				breed: true,
				age: true,
				gender: true,
				weight: true,
				status: true,
				description: true,
				personality: true,
				photos: true,
				videos: true,
				foundLocation: true,
				rescueDate: true,
			},
		});

		if (!animal) {
			throw new ApiError("Animal not found", 404, "ANIMAL_NOT_FOUND");
		}

		// Only allow public access for these statuses
		if (!["foster", "adoption_ready"].includes(animal.status)) {
			throw new ApiError("This animal is not currently available", 403, "ANIMAL_NOT_AVAILABLE");
		}

		// 2. Get simplified medical summary
		const medicalRecord = await fastify.db.query.animalMedicalRecords.findFirst({
			where: eq(animalMedicalRecords.animalId, animalId),
			orderBy: (fields, { desc }) => [desc(fields.createdAt)],
			columns: {
				vaccines: true,
				conditions: true,
				nextCheckup: true,
			},
		});

		const isVaccinated = Array.isArray(medicalRecord?.vaccines) && medicalRecord.vaccines.length > 0;

		// 3. Get simplified public timeline
		const timeline = await fastify.db
			.select({
				eventType: animalTimeline.eventType,
				description: animalTimeline.description,
				eventDate: animalTimeline.eventDate,
			})
			.from(animalTimeline)
			.where(
				and(
					eq(animalTimeline.animalId, animalId),
					inArray(animalTimeline.eventType, ["rescued", "intake", "vaccinated", "medical_checkup"]),
				),
			)
			.orderBy(animalTimeline.eventDate);

		return reply.success(
			{
				animal: {
					...animal,
					isVaccinated,
					conditions: medicalRecord?.conditions || [],
					nextCheckup: medicalRecord?.nextCheckup || null,
				},
				timeline,
			},
			"Animal public profile fetched successfully",
		);
	});

	/** Apply to foster */
	fastify.post(
		"/:animalId/foster-apply",
		{
			preHandler: [publicAuthMiddleware, requireRole(["foster_volunteer", "adopter"])],
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { animalId } = request.params as { animalId: string };
			const userId = request.user!.id;

			if (!animalId) {
				throw new ApiError("Animal ID is required", 400, "ANIMAL_ID_REQUIRED");
			}

			// Check if already applied
			const existing = await fastify.db.query.fosters.findFirst({
				where: and(eq(fosters.animalId, animalId), eq(fosters.userId, userId)),
			});

			if (existing) {
				throw new ApiError("You have already applied to foster this animal", 409, "ALREADY_APPLIED");
			}

			// also check animal exists + is fosterable
			const [animal] = await fastify.db.select().from(animals).where(eq(animals.id, animalId)).limit(1);

			if (!animal) {
				throw new ApiError("Animal not found", 404, "ANIMAL_NOT_FOUND");
			}

			if (!["foster", "adoption_ready"].includes(animal.status)) {
				throw new ApiError(
					"This animal is not currently available for fostering",
					400,
					"ANIMAL_NOT_AVAILABLE",
				);
			}

			const [userDetails] = await fastify.db.select().from(users).where(eq(users.id, userId)).limit(1);

			if (!userDetails) {
				throw new ApiError("User not found", 404, "USER_NOT_FOUND");
			}

			const [latestMedical] = await fastify.db
				.select({
					conditions: animalMedicalRecords.conditions,
				})
				.from(animalMedicalRecords)
				.where(eq(animalMedicalRecords.animalId, animalId))
				.orderBy(desc(animalMedicalRecords.createdAt))
				.limit(1);

			const activeConditions = latestMedical?.conditions ?? [];

			const geminiService = new GeminiService(process.env.GEMINI_API_KEY!);

			const fosterMatch = await geminiService.scoreFosterRequest(
				{
					fosterExperience: userDetails.fosterExperience,
					availability: userDetails.availability,
					location: userDetails.location,
					fullName: userDetails.fullName,
				},
				{
					name: animal.name,
					species: animal.species,
					age: animal.age,
					gender: animal.gender,
					description: animal.description,
					personality: animal.personality,
					breed: animal.breed,
					conditions: activeConditions,
				},
			);

			await fastify.db.insert(fosters).values({
				animalId,
				userId,
				startDate: null,
				endDate: null,
				status: "applied",
				matchScore: fosterMatch.success ? fosterMatch.data.matchScore : null,
				notes: fosterMatch.success ? fosterMatch.data.summary : null,
			});

			return reply.success(null, "Foster application submitted successfully", 201);
		},
	);

	/** Apply to adopt */
	fastify.post(
		"/:animalId/adopt-apply",
		{
			preHandler: [publicAuthMiddleware, requireRole(["adopter"])],
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { animalId } = request.params as { animalId: string };
			const userId = request.user!.id;

			if (!animalId) {
				throw new ApiError("Animal ID is required", 400, "ANIMAL_ID_REQUIRED");
			}

			// Check if already applied
			const existing = await fastify.db.query.adoptions.findFirst({
				where: and(eq(adoptions.animalId, animalId), eq(adoptions.adopterId, userId)),
			});

			if (existing) {
				throw new ApiError("You have already applied to adopt this animal", 409, "ALREADY_APPLIED");
			}

			// check animal is adoption_ready
			const animal = await fastify.db.query.animals.findFirst({
				where: eq(animals.id, animalId),
				columns: { id: true, status: true },
			});

			if (!animal) {
				throw new ApiError("Animal not found", 404, "ANIMAL_NOT_FOUND");
			}

			if (animal.status !== "adoption_ready") {
				throw new ApiError(
					"This animal is not currently available for adoption",
					400,
					"ANIMAL_NOT_AVAILABLE",
				);
			}

			await fastify.db.insert(adoptions).values({
				animalId,
				adopterId: userId,
				applicationDate: new Date(),
				approvalDate: null,
				matchScore: null,
			});

			return reply.success(null, "Adoption application submitted successfully", 201);
		},
	);

	/** Get fosters page data */
	fastify.get(
		"/fosters",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const {
				pageIndex: rPageIndex = "1",
				pageSize = "12",
				search = "",
				status,
			} = request.query as {
				pageIndex?: string;
				pageSize?: string;
				search?: string;
				status?: string;
			};

			const pageIndex = Math.max(1, parseInt(rPageIndex));
			const limit = Math.min(50, parseInt(pageSize));
			const offset = (pageIndex - 1) * limit;

			// Build conditions
			const conditions = [];

			// Optional status filter (e.g. "applied", "active", "completed")
			if (status && status !== "all") {
				conditions.push(eq(fosters.status, status));
			}

			// Search across foster name, email, animal name, animalId
			if (search.trim()) {
				conditions.push(
					or(
						ilike(users.fullName, `%${search}%`),
						ilike(users.email, `%${search}%`),
						ilike(animals.name, `%${search}%`),
						ilike(animals.animalId, `%${search}%`),
					)!,
				);
			}

			const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

			// Total count
			const [{ count: total }] = await fastify.db
				.select({ count: count() })
				.from(fosters)
				.leftJoin(users, eq(fosters.userId, users.id))
				.leftJoin(animals, eq(fosters.animalId, animals.id))
				.where(whereClause);

			// Main query
			const fosterRequests = await fastify.db
				.select({
					// Foster record
					id: fosters.id,
					status: fosters.status,
					startDate: fosters.startDate,
					endDate: fosters.endDate,
					matchScore: fosters.matchScore,
					notes: fosters.notes,
					createdAt: fosters.createdAt,
					updatedAt: fosters.updatedAt,

					// Foster user info
					userId: users.id,
					fullName: users.fullName,
					email: users.email,
					phone: users.phone,
					address: users.address,
					availability: users.availability,
					location: users.location,

					// Animal basic info
					animalId: animals.id,
					animalCode: animals.animalId,
					animalName: animals.name,
					animalBreed: animals.breed,
					animalSpecies: animals.species,
					animalPhotos: animals.photos,
					animalStatus: animals.status,
				})
				.from(fosters)
				.leftJoin(users, eq(fosters.userId, users.id))
				.leftJoin(animals, eq(fosters.animalId, animals.id))
				.where(whereClause)
				.orderBy(desc(fosters.createdAt))
				.limit(limit)
				.offset(offset);

			const totalPages = Math.ceil(Number(total) / limit);

			return reply.success(
				{
					fosters: fosterRequests,
					pagination: {
						page: pageIndex,
						pageSize: limit,
						total: Number(total),
						totalPages,
						hasNext: pageIndex < totalPages,
						hasPrev: pageIndex > 1,
					},
				},
				"Foster requests fetched successfully",
			);
		},
	);

	/** Approve a foster request */
	fastify.post(
		"/fosters/:fosterId/approve",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { fosterId } = request.params as { fosterId: string };

			if (!fosterId) {
				throw new ApiError("Foster ID is required", 400, "FOSTER_ID_REQUIRED");
			}

			await fastify.db
				.update(fosters)
				.set({ status: "approved", startDate: new Date() })
				.where(eq(fosters.id, fosterId));

			return reply.success(null, "Foster request approved successfully");
		},
	);

	/** End a foster term */
	fastify.post(
		"/fosters/:fosterId/terminate",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { fosterId } = request.params as { fosterId: string };

			if (!fosterId) {
				throw new ApiError("Foster ID is required", 400, "FOSTER_ID_REQUIRED");
			}

			await fastify.db
				.update(fosters)
				.set({ status: "ended", endDate: new Date() })
				.where(eq(fosters.id, fosterId));

			return reply.success(null, "Foster request terminated successfully");
		},
	);

	/** Reject a foster request*/
	fastify.post(
		"/fosters/:fosterId/reject",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { fosterId } = request.params as { fosterId: string };

			if (!fosterId) {
				throw new ApiError("Foster ID is required", 400, "FOSTER_ID_REQUIRED");
			}

			await fastify.db.update(fosters).set({ status: "rejected" }).where(eq(fosters.id, fosterId));

			return reply.success(null, "Foster request rejected and terminated successfully");
		},
	);

	/** Get adoptions page data */
	fastify.get(
		"/adoptions",
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

			// Build conditions
			const conditions = [];

			// Search across foster name, email, animal name, animalId
			if (search.trim()) {
				conditions.push(
					or(
						ilike(users.fullName, `%${search}%`),
						ilike(users.email, `%${search}%`),
						ilike(animals.name, `%${search}%`),
						ilike(animals.animalId, `%${search}%`),
					)!,
				);
			}

			const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

			// Total count
			const [{ count: total }] = await fastify.db
				.select({ count: count() })
				.from(adoptions)
				.leftJoin(users, eq(adoptions.adopterId, users.id))
				.leftJoin(animals, eq(adoptions.animalId, animals.id))
				.where(whereClause);

			// Main query
			const adoptionRequests = await fastify.db
				.select({
					// Foster record
					id: adoptions.id,
					applicationDate: adoptions.applicationDate,
					approvalDate: adoptions.approvalDate,
					matchScore: adoptions.matchScore,
					notes: adoptions.notes,
					createdAt: adoptions.createdAt,

					// Foster user info
					userId: users.id,
					fullName: users.fullName,
					email: users.email,
					phone: users.phone,
					address: users.address,
					availability: users.availability,
					location: users.location,

					// Animal basic info
					animalId: animals.id,
					animalCode: animals.animalId,
					animalName: animals.name,
					animalBreed: animals.breed,
					animalSpecies: animals.species,
					animalPhotos: animals.photos,
					animalStatus: animals.status,
				})
				.from(adoptions)
				.leftJoin(users, eq(adoptions.adopterId, users.id))
				.leftJoin(animals, eq(adoptions.animalId, animals.id))
				.where(whereClause)
				.orderBy(desc(adoptions.applicationDate))
				.limit(limit)
				.offset(offset);

			const totalPages = Math.ceil(Number(total) / limit);

			return reply.success(
				{
					adoptions: adoptionRequests,
					pagination: {
						page: pageIndex,
						pageSize: limit,
						total: Number(total),
						totalPages,
						hasNext: pageIndex < totalPages,
						hasPrev: pageIndex > 1,
					},
				},
				"Adoptions requests fetched successfully",
			);
		},
	);

	/** Approve an adoption request */
	fastify.post(
		"/adoption/:id/approve",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { id } = request.params as { id: string };

			if (!id) {
				throw new ApiError(
					"Id associated with the adoption request is required",
					400,
					"ADOPTION_ID_REQUIRED",
				);
			}

			await fastify.db.update(adoptions).set({ approvalDate: new Date() }).where(eq(adoptions.id, id));

			return reply.success(null, "Adoption request approved successfully");
		},
	);

	/** Get recommended animals */
	fastify.get(
		"/recommended",
		{
			preHandler: [publicAuthMiddleware, requireRole(["foster_volunteer", "adopter"])],
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const userId = request.user!.id;

			const [userDetails] = await fastify.db.select().from(users).where(eq(users.id, userId)).limit(1);

			if (!userDetails) {
				throw new ApiError("User not found", 404, "USER_NOT_FOUND");
			}

			// 2. Get first 15 fosterable animals (newest first)
			const fosterAnimals = await fastify.db
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
					foundLocation: animals.foundLocation,
				})
				.from(animals)
				.where(or(eq(animals.status, "foster"), eq(animals.status, "adoption_ready")))
				.orderBy(desc(animals.createdAt))
				.limit(15);

			if (fosterAnimals.length === 0) {
				return reply.success({ recommended: [] }, "No fosterable animals available right now");
			}

			const animalIds = fosterAnimals.map((a) => a.id);

			const medicalRows = await fastify.db
				.select({
					animalId: animalMedicalRecords.animalId,
					conditions: animalMedicalRecords.conditions,
					createdAt: animalMedicalRecords.createdAt,
				})
				.from(animalMedicalRecords)
				.where(inArray(animalMedicalRecords.animalId, animalIds))
				.orderBy(desc(animalMedicalRecords.createdAt));

			// Keep only the latest medical record per animal
			const latestConditionsMap = new Map<string, string[]>();
			for (const row of medicalRows) {
				if (!latestConditionsMap.has(row.animalId)) {
					latestConditionsMap.set(row.animalId, row.conditions || []);
				}
			}

			// 4. Score each animal with Gemini
			const geminiService = new GeminiService(process.env.GEMINI_API_KEY!);

			const batchInput = fosterAnimals.map((animal) => ({
				id: animal.id,
				name: animal.name,
				species: animal.species,
				breed: animal.breed,
				age: animal.age,
				gender: animal.gender,
				description: animal.description,
				personality: animal.personality,
				status: animal.status,
				conditions: latestConditionsMap.get(animal.id) || [],
			}));

			const scoreResult = await geminiService.scoreFosterRequestBatch(
				{
					fullName: userDetails.fullName,
					availability: userDetails.availability,
					location: userDetails.location,
					fosterExperience: userDetails.fosterExperience,
				},
				batchInput,
			);

			if (!scoreResult.success) {
				throw new ApiError("Failed to generate recommendations", 500, "SCORING_FAILED");
			}

			const scoreMap = new Map(scoreResult.data.map((s) => [s.animalId, s]));

			const recommended = fosterAnimals
				.map((animal) => {
					const score = scoreMap.get(animal.id);
					return {
						...animal,
						matchScore: score?.matchScore ?? 0,
						matchSummary: score?.summary ?? null,
						recommendation: score?.recommendation ?? "weak",
						strengths: score?.strengths ?? [],
						concerns: score?.concerns ?? [],
					};
				})
				.sort((a, b) => b.matchScore - a.matchScore);

			return reply.success({ recommended }, "Recommended animals fetched successfully");
		},
	);
}
