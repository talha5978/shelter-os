import "fastify";
import type { DbClient } from "@workspace/db";
import type { UserPayload } from "@workspace/auth";

declare module "fastify" {
	interface FastifyInstance {
		db: DbClient;
	}

	interface FastifyRequest {
		user: UserPayload | null;
	}

	interface FastifyReply {
		success<D>(data: D, message?: string, statusCode?: number): FastifyReply;
	}
}
