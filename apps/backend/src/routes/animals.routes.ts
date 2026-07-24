import { animals, type AnimalStatus, type Gender, type MediaAsset, type Species } from "@workspace/db";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { adminAuthMiddleware, requireRole } from "~/middlewares/auth.middleware";
import { ApiError } from "~/utils/ApiError";

export async function animalsRoutes(fastify: FastifyInstance) {
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
}
