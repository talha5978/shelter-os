import type { Animal, AnimalStatus, Gender, MediaAsset, Species } from "@workspace/db";
import { createApiClient } from "~/api/client";
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
			return await client.request<ApiResponse<{ animal: Animal }>>("/animals/", {
				method: "POST",
				body: JSON.stringify(data),
			});
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
			if (pageIndex) queryParams.set("page", String(pageIndex));
			if (pageSize) queryParams.set("size", String(pageSize));

			return await client.request<ApiResponse<AllAnimalsResponse>>(
				`/animals/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
			);
		},
	};
}
