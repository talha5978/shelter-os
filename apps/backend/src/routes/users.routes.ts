import { hashPassword } from "@workspace/auth";
import { users } from "@workspace/db";
import { and, count, desc, eq, ilike, ne, or } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { adminAuthMiddleware, requireRole } from "~/middlewares/auth.middleware";
import { ApiError } from "~/utils/ApiError";

export async function usersRoutes(fastify: FastifyInstance) {
	/** GET all users for admin */
	fastify.get(
		"/",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin"])] },
		async (request, reply) => {
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
			const condition = and(
				search.trim()
					? or(
							ilike(users.fullName, `%${search}%`),
							ilike(users.email, `%${search}%`),
							ilike(users.location, `%${search}%`),
						)
					: undefined,
				ne(users.id, request.user!.id),
			);

			// Get total count for pagination
			const [{ count: total }] = await fastify.db
				.select({ count: count() })
				.from(users)
				.where(condition);

			// Fetch animals with selected fields
			const usersList = await fastify.db
				.select()
				.from(users)
				.where(condition)
				.orderBy(desc(users.createdAt))
				.limit(limit)
				.offset(offset);

			const totalPages = Math.ceil(Number(total) / limit);

			return reply.success({
				users: usersList,
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

	/** Toggle user verification */
	fastify.post(
		"/:userId/toggle-verification",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin"])] },
		async (request, reply) => {
			const { userId } = request.params as { userId: string };

			const [user] = await fastify.db
				.select({ isVerified: users.isVerified })
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (!user) {
				throw new ApiError("User not found", 404, "USER_NOT_FOUND");
			}

			await fastify.db.update(users).set({ isVerified: !user.isVerified }).where(eq(users.id, userId));

			return reply.success(null, `User ${user.isVerified ? "unverified" : "verified"} successfully`);
		},
	);

	/** Create staff member profile */
	fastify.post(
		"/staff",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin"])] },
		async (request, reply) => {
			const { fullName, email, phone, address, password } = request.body as {
				fullName: string;
				email: string;
				phone: string | null;
				address: string | null;
				password: string;
			};

			if (!fullName || !email || !password) {
				throw new ApiError("Full name, email and password are required", 400, "MISSING_FIELDS");
			}

			// Check if email already exists
			const existingUser = await fastify.db.query.users.findFirst({
				where: eq(users.email, email.toLowerCase().trim()),
			});

			if (existingUser) {
				throw new ApiError("A user with this email already exists", 409, "EMAIL_ALREADY_EXISTS");
			}

			const hashedPassword = await hashPassword(password);

			const [newStaff] = await fastify.db
				.insert(users)
				.values({
					fullName: fullName.trim(),
					email: email.toLowerCase().trim(),
					phone: phone?.trim() || null,
					address: address?.trim() || null,
					password: hashedPassword,
					role: "shelter_staff",
					isVerified: true,
				})
				.returning({
					id: users.id,
				});

			if (!newStaff) {
				throw new ApiError("Failed to create staff member", 500, "FAILED_TO_CREATE_STAFF");
			}

			return reply.success(null, "Shelter staff member created successfully", 201);
		},
	);
}
