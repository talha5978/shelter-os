import type { ApiResponse } from "~/types/response";
import { createApiClient } from "~/api/client";
import { queryOptions } from "@tanstack/react-query";
import { queryClient } from "~/lib/tanstackQueryClient";
import type { AllUsersResponse, UserDetails } from "~/types/users";
import { invalidateCache } from "~/utils/invalidate";

export function createUsersApi(client = createApiClient()) {
	return {
		client,

		async getAllUsers({
			search,
			pageIndex,
			pageSize,
		}: {
			search?: string;
			pageIndex?: number;
			pageSize?: number;
		}) {
			const queryParams = new URLSearchParams();

			if (search) queryParams.set("search", search);
			if (pageIndex) queryParams.set("pageIndex", String(pageIndex));
			if (pageSize) queryParams.set("pageSize", String(pageSize));

			const qo = queryOptions<ApiResponse<AllUsersResponse>>({
				queryKey: ["all_users", queryParams.toString()],
				queryFn: async () => {
					return await client.request<ApiResponse<AllUsersResponse>>(
						`/users/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
					);
				},
			});

			return await queryClient.fetchQuery(qo);
		},

		async toggleVerification(userId: string) {
			const response = await client.request<ApiResponse<{ message: string }>>(
				`/users/${userId}/toggle-verification`,
				{
					method: "POST",
					body: JSON.stringify({}),
				},
			);

			await invalidateCache("all_users");
			await invalidateCache(`user:${userId}`);

			return response;
		},

		async createStaff(data: {
			fullName: string;
			email: string;
			phone: string | null;
			address: string | null;
			password: string;
		}) {
			const response = await client.request<ApiResponse<null>>(`/users/staff`, {
				method: "POST",
				body: JSON.stringify(data),
			});

			await invalidateCache("all_users");

			return response;
		},

		async fetchUserDetails(userId: string) {
			const qo = queryOptions<ApiResponse<UserDetails>>({
				queryKey: [`user:${userId}`],
				queryFn: async () => {
					return await client.request<ApiResponse<UserDetails>>(`/users/${userId}`);
				},
			});

			return await queryClient.fetchQuery(qo);
		},
	};
}
