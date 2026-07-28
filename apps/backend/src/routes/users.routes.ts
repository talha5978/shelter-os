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
}
