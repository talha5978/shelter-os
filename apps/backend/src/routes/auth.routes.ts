import { users } from "@workspace/db";
import { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import { and, eq } from "drizzle-orm";
import { comparePassword, hashPassword, jwtService } from "@workspace/auth";
import { ApiError } from "~/utils/ApiError";
import { adminAuthMiddleware, publicAuthMiddleware } from "~/middlewares/auth.middleware";
import { convertExpiresInToSeconds } from "~/utils/time";
import type { CookieSerializeOptions } from "@fastify/csrf-protection";

export async function authRoutes(fastify: FastifyInstance) {
	/** Get current admin */
	fastify.get("/admin/me", { preHandler: adminAuthMiddleware }, async (request, reply) => {
		return reply.success(
			{
				user: request.user,
			},
			"User retrieved successfully",
		);
	});

	/** Get current public user */
	fastify.get("/public/me", { preHandler: publicAuthMiddleware }, async (request, reply) => {
		return reply.success(
			{
				user: request.user,
			},
			"User retrieved successfully",
		);
	});

	/** Refresh jwt token */
	fastify.post("/refresh-token", async (request: FastifyRequest, reply: FastifyReply) => {
		const isAdminRefresh = !!request.cookies?.adminRefreshToken;
		const refreshToken = request.cookies?.adminRefreshToken || request.cookies?.publicRefreshToken;

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

			const authCookieName = isAdminRefresh ? "adminAuthToken" : "publicAuthToken";
			const refreshCookieName = isAdminRefresh ? "adminRefreshToken" : "publicRefreshToken";

			// Set new cookies
			reply.setCookie(authCookieName, newAccessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
				maxAge: convertExpiresInToSeconds(process.env.JWT_EXPIRES_IN || "15m"),
				path: "/",
			});

			reply.setCookie(refreshCookieName, newRefreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
				maxAge: 30 * 24 * 60 * 60, // 30 days
				path: "/",
			});

			return reply.success(null, "Token refreshed successfully", 200);
		} catch (err) {
			reply.clearCookie("adminAuthToken").clearCookie("adminRefreshToken");
			reply.clearCookie("publicAuthToken").clearCookie("publicRefreshToken");
			throw new ApiError("Session expired. Please login again", 401, "SESSION_EXPIRED");
		}
	});

	/** Admin sign in */
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
				.where(and(eq(users.email, body.email), eq(users.isVerified, true)))
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

	/** Public sign in */
	fastify.post(
		"/public/signin",
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
				.where(and(eq(users.email, body.email), eq(users.isVerified, true)))
				.limit(1);

			if (!user) {
				throw new ApiError("Invalid credentials.", 401, "INVALID_CREDENTIALS");
			}

			if (user.role && (user.role === "admin" || user.role === "shelter_staff")) {
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
			reply.setCookie("publicAuthToken", accessTokenData, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
				maxAge: convertExpiresInToSeconds(process.env.JWT_EXPIRES_IN),
				path: "/",
			});

			reply.setCookie("publicRefreshToken", refreshToken, {
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

	fastify.post("/public/signup", {}, async (request: FastifyRequest, reply: FastifyReply) => {
		const body = request.body as {
			email: string;
			password: string;
			fullName: string;
			phone: string;
			address: string;
			role: "foster_volunteer" | "adopter";
			fosterExperience: string;
			availability: string;
			location: string;
		};

		const result = await fastify.db.transaction(async (tx) => {
			const [user] = await tx
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

			if (user) {
				throw new ApiError("User already exists", 400, "USER_ALREADY_EXISTS");
			}

			const hashedPassword = await hashPassword(body.password);

			const [createdUser] = await tx
				.insert(users)
				.values({
					isVerified: true,
					email: body.email,
					password: hashedPassword,
					fullName: body.fullName,
					phone: body.phone,
					address: body.address,
					role: body.role,
					fosterExperience: body.fosterExperience,
					availability: body.availability,
					location: body.location,
					avatarUrl: null,
				})
				.returning({
					id: users.id,
					fullName: users.fullName,
					email: users.email,
					password: users.password,
					role: users.role,
				});

			// Generate tokens
			const accessTokenData = jwtService.generateToken({
				id: createdUser.id,
				email: createdUser.email,
				name: createdUser.fullName,
				role: createdUser.role,
			});

			const refreshToken = jwtService.generateRefreshToken(createdUser.id);

			// Set cookies
			reply.setCookie("publicAuthToken", accessTokenData, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
				maxAge: convertExpiresInToSeconds(process.env.JWT_EXPIRES_IN),
				path: "/",
			});

			reply.setCookie("publicRefreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
				maxAge: 30 * 24 * 60 * 60,
				path: "/",
			});

			return createdUser;
		});

		return reply.success(
			{
				user: result,
			},
			"Signed up successfully",
		);
	});

	/** Signout */
	fastify.post("/signout", async (request: FastifyRequest, reply: FastifyReply) => {
		const { isAdmin } = request.query as { isAdmin?: string };

		const cookieOptions: CookieSerializeOptions | undefined = {
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
		};

		if (isAdmin === "true") {
			reply
				.clearCookie("adminAuthToken", cookieOptions)
				.clearCookie("adminRefreshToken", cookieOptions);
		} else {
			reply
				.clearCookie("publicAuthToken", cookieOptions)
				.clearCookie("publicRefreshToken", cookieOptions);
		}

		return reply.success(null, "Logged out successfully");
	});
}
