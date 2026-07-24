import { animals, type AnimalStatus, type Gender, type MediaAsset, type Species } from "@workspace/db";
import { count, desc, ilike, or, sql } from "drizzle-orm";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { adminAuthMiddleware, requireRole } from "~/middlewares/auth.middleware";
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
			console.log(animalList);
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
}
