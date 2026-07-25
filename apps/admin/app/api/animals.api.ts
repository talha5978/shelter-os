import { queryOptions } from "@tanstack/react-query";
import type { Animal, AnimalStatus, Gender, MediaAsset, Species } from "@workspace/db";
import { createApiClient } from "~/api/client";
import { queryClient } from "~/lib/tanstackQueryClient";
import type { AllAnimalsResponse } from "~/types/animals";
import type { ApiResponse } from "~/types/response";

export function createAnimalsApi(client = createApiClient()) {
	return {
		client,

		async createAnimal(data: {
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
		}) {
			const resp = await client.request<ApiResponse<{ animal: Animal }>>("/animals/", {
				method: "POST",
				body: JSON.stringify(data),
			});

			await queryClient.invalidateQueries({ queryKey: ["all_animals"] });

			return resp;
		},

		async getAllAnimals({
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

			const qo = queryOptions<ApiResponse<AllAnimalsResponse>>({
				queryKey: ["all_animals", queryParams.toString()],
				queryFn: async () => {
					return await client.request<ApiResponse<AllAnimalsResponse>>(
						`/animals/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
					);
				},
			});

			return await queryClient.fetchQuery(qo);
		},
	};
}
