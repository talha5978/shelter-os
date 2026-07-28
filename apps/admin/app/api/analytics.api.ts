import { queryOptions } from "@tanstack/react-query";
import { createApiClient } from "~/api/client";
import { queryClient } from "~/lib/tanstackQueryClient";
import type { DashboardAnalytics } from "~/types/dashboard";
import type { ApiResponse } from "~/types/response";

export function createAnalyticsApi(client = createApiClient()) {
	return {
		client,

		async getDashboardAnalytics() {
			const qo = queryOptions<ApiResponse<DashboardAnalytics>>({
				queryKey: [`dashboard_analytics`],
				queryFn: async () => {
					return await client.request<ApiResponse<DashboardAnalytics>>("/analytics/dashboard");
				},
			});

			return await queryClient.fetchQuery(qo);
		},
	};
}
