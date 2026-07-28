import type { User } from "@workspace/db";

export type AllUsersResponse = {
	users: User[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
};
