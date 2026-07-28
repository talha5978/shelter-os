import type { ApiResponse } from "~/types/response";
import { createApiClient } from "~/api/client";
import { queryOptions } from "@tanstack/react-query";
import { queryClient } from "~/lib/tanstackQueryClient";
import type { AnimalProfile, AnimalsResponse } from "~/types/animals";

export function createAnimalsApi(client = createApiClient()) {
	return {
		client,

		async getAnimals({
			search,
			pageIndex,
			pageSize,
			species,
		}: {
			pageIndex?: string;
			pageSize?: string;
			search?: string;
			species?: string;
		}) {
			const queryParams = new URLSearchParams();

			if (search) queryParams.set("search", search);
			if (pageIndex) queryParams.set("pageIndex", String(pageIndex));
			if (pageSize) queryParams.set("pageSize", String(pageSize));
			if (species) queryParams.set("species", species);

			const qo = queryOptions<ApiResponse<AnimalsResponse>>({
				queryKey: ["animals", queryParams.toString()],
				queryFn: async () => {
					return await client.request<ApiResponse<AnimalsResponse>>(
						`/animals/public${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
					);
				},
			});

			return await queryClient.fetchQuery(qo);
		},

		async getAnimalProfile(animalId: string) {
			const qo = queryOptions<ApiResponse<AnimalProfile>>({
				queryKey: [`animal_profile:${animalId}`],
				queryFn: async () => {
					return await client.request<ApiResponse<AnimalProfile>>(
						`/animals/${animalId}/public-profile`,
					);
				},
			});

			return await queryClient.fetchQuery(qo);
		},
	};
}
