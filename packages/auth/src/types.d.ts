import type { UserRole } from "@workspace/db";

export type UserPayload = {
	id: string;
	name: string;
	role: UserRole;
	email: string;
};
