import { users } from "@workspace/db";
import { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { comparePassword, jwtService } from "@workspace/auth";
import { ApiError } from "~/utils/ApiError";
import { adminAuthMiddleware } from "~/middlewares/auth.middleware";
import { convertExpiresInToSeconds } from "~/utils/time";
import type { CookieSerializeOptions } from "@fastify/csrf-protection";

export async function authRoutes(fastify: FastifyInstance) {
	fastify.get("/admin/me", { preHandler: adminAuthMiddleware }, async (request, reply) => {
		return reply.success(
			{
				user: request.user,
			},
			"User retrieved successfully",
		);
	});

	fastify.post("/refresh-token", async (request: FastifyRequest, reply: FastifyReply) => {
		const refreshToken = request.cookies?.adminRefreshToken;

		if (!refreshToken) {
			throw new ApiError("Refresh token required", 401, "NO_REFRESH_TOKEN");
		}

		try {
			const { id } = jwtService.verifyRefreshToken(refreshToken);

			const userData = await fastify.db
				.select({
					id: users.id,
					name: users.fullName,
					email: users.email,
					role: users.role,
				})
				.from(users)
				.where(eq(users.id, id))
				.limit(1);

			if (userData.length === 0) {
				throw new ApiError("User not found", 401, "USER_NOT_FOUND");
			}

			const user = userData[0];

			const newAccessToken = jwtService.generateToken({
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
			});

			const newRefreshToken = jwtService.generateRefreshToken(user.id);

			// Set new cookies
			reply.setCookie("adminAuthToken", newAccessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
				maxAge: convertExpiresInToSeconds(process.env.JWT_EXPIRES_IN || "15m"),
				path: "/",
			});

			reply.setCookie("adminRefreshToken", newRefreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
				maxAge: 30 * 24 * 60 * 60, // 30 days
				path: "/",
			});

			return reply.success(null, "Token refreshed successfully", 200);
		} catch (err) {
			reply.clearCookie("adminAuthToken").clearCookie("adminRefreshToken");
			throw new ApiError("Session expired. Please login again", 401, "SESSION_EXPIRED");
		}
	});

	fastify.post(
		"/admin/signin",
		{
			schema: {
				body: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: { type: "string", format: "email" },
						password: { type: "string" },
					},
				},
			},
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const body = request.body as {
				email: string;
				password: string;
			};

			// Find user
			const [user] = await fastify.db
				.select({
					id: users.id,
					fullName: users.fullName,
					email: users.email,
					password: users.password,
					role: users.role,
				})
				.from(users)
				.where(eq(users.email, body.email))
				.limit(1);

			if (!user) {
				throw new ApiError("Invalid credentials.", 401, "INVALID_CREDENTIALS");
			}

			if (user.role && user.role !== "admin") {
				throw new ApiError("You are not allowed to sign in", 404, "INVALID_DATA");
			}

			// Verify password
			const isPasswordValid = await comparePassword(body.password, user.password);

			if (!isPasswordValid) {
				throw new ApiError("Invalid credentials", 401, "INVALID_CREDENTIALS");
			}

			// Generate tokens
			const accessTokenData = jwtService.generateToken({
				id: user.id,
				email: user.email,
				name: user.fullName,
				role: user.role,
			});

			const refreshToken = jwtService.generateRefreshToken(user.id);

			// Set cookies
			reply.setCookie("adminAuthToken", accessTokenData, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
				maxAge: convertExpiresInToSeconds(process.env.JWT_EXPIRES_IN),
				path: "/",
			});

			reply.setCookie("adminRefreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
				maxAge: 30 * 24 * 60 * 60,
				path: "/",
			});

			return reply.success(
				{
					user: accessTokenData,
				},
				"Signed in successfully",
			);
		},
	);

	/** Signout */
	fastify.post("/signout", async (_request: FastifyRequest, reply: FastifyReply) => {
		const cookieOptions: CookieSerializeOptions | undefined = {
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
		};

		reply.clearCookie("adminAuthToken", cookieOptions).clearCookie("adminRefreshToken", cookieOptions);

		return reply.success(null, "Logged out successfully");
	});
}
