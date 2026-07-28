import { queryOptions } from "@tanstack/react-query";
import type {
	Animal,
	AnimalStatus,
	AnimalTimeline,
	Gender,
	MediaAsset,
	MedicalRecord,
	Medication,
	Species,
	TimelineMetaData,
	Vaccine,
} from "@workspace/db";
import { createApiClient } from "~/api/client";
import { queryClient } from "~/lib/tanstackQueryClient";
import type {
	AllAdoptionRequests,
	AllAnimalsResponse,
	AllFosterRequests,
	AllMedicalRecordsResp,
} from "~/types/animals";
import type { ApiResponse } from "~/types/response";
import { invalidateCache } from "~/utils/invalidate";

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

			await invalidateCache("all_animals");

			return resp;
		},

		async updateAnimal(
			id: string,
			data: {
				name?: string;
				species?: Species;
				breed?: string;
				age?: number;
				gender?: Gender;
				weight?: number;
				foundLocation?: string;
				description?: string;
				personality?: string;
				status?: AnimalStatus;
				images?: MediaAsset[];
				videos?: MediaAsset[];
			},
		) {
			const resp = await client.request<ApiResponse<{ animal: Animal }>>(`/animals/${id}`, {
				method: "PUT",
				body: JSON.stringify(data),
			});

			await invalidateCache("all_animals");
			await invalidateCache(`animal-update:${id}`);
			await invalidateCache(`all-medical-records`);

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
						`/animals${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
					);
				},
			});

			return await queryClient.fetchQuery(qo);
		},

		async addMedicalRecord(
			animalId: string,
			data: {
				vaccines: Vaccine[];
				medications: Medication[];
				conditions?: string[];
				nextCheckup: Date | null;
				notes: string | null;
			},
		) {
			const resp = await client.request<ApiResponse<{ animal: Animal }>>(
				`/animals/${animalId}/medical`,
				{
					method: "POST",
					body: JSON.stringify(data),
				},
			);

			await invalidateCache(`medical-records:${animalId}`);
			await invalidateCache("all-medical-records");

			return resp;
		},

		async getMedicalRecordsById(animalId: string) {
			type ReturnType = ApiResponse<{
				records: MedicalRecord[];
				animal: {
					id: string;
					name: string;
					animalId: string;
				};
			}>;
			const qo = queryOptions<ReturnType>({
				queryKey: [`medical-records:${animalId}`],
				queryFn: async () => {
					return await client.request<ReturnType>(`/animals/${animalId}/medical`);
				},
			});

			return await queryClient.fetchQuery(qo);
		},

		async getMedicalRecords({
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

			const qo = queryOptions<ApiResponse<AllMedicalRecordsResp>>({
				queryKey: [`all-medical-records`, queryParams.toString()],
				queryFn: async () => {
					return await client.request<ApiResponse<AllMedicalRecordsResp>>(
						`/animals/medical${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
					);
				},
			});

			return await queryClient.fetchQuery(qo);
		},

		async addTimeline(
			animalId: string,
			data: {
				eventType: string;
				description: string;
				eventDate: string;
				metadata: {
					location?: string;
					associatedPerson?: string;
					referenceCodeOrBatch?: string;
					numericValue?: unknown;
				};
			},
		) {
			const resp = await client.request<ApiResponse<{ animal: Animal }>>(
				`/animals/${animalId}/timeline`,
				{
					method: "POST",
					body: JSON.stringify(data),
				},
			);

			await invalidateCache(`timeline:${animalId}`);

			return resp;
		},

		async getTimelineHistory(animalId: string) {
			type ReturnType = ApiResponse<{
				timeline: (AnimalTimeline & { metadata: TimelineMetaData })[];
				animal: {
					id: string;
					name: string;
					animalId: string;
				};
			}>;
			const qo = queryOptions<ReturnType>({
				queryKey: [`timeline:${animalId}`],
				queryFn: async () => {
					return await client.request<ReturnType>(`/animals/${animalId}/timeline`);
				},
			});

			return await queryClient.fetchQuery(qo);
		},

		async getAnimalForUpdate(animalId: string) {
			const qo = queryOptions<ApiResponse<{ animal: Animal }>>({
				queryKey: [`animal-update:${animalId}`],
				queryFn: async () => {
					return await client.request<ApiResponse<{ animal: Animal }>>(
						`/animals/${animalId}/update-profile`,
					);
				},
			});

			return await queryClient.fetchQuery(qo);
		},

		async getFosterRequests({
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

			const qo = queryOptions<ApiResponse<AllFosterRequests>>({
				queryKey: [`all_fosters`, queryParams.toString()],
				queryFn: async () => {
					return await client.request<ApiResponse<AllFosterRequests>>(
						`/animals/fosters${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
					);
				},
			});

			return await queryClient.fetchQuery(qo);
		},

		async getAdoptionsRequests({
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

			const qo = queryOptions<ApiResponse<AllAdoptionRequests>>({
				queryKey: [`all_adoptions`, queryParams.toString()],
				queryFn: async () => {
					return await client.request<ApiResponse<AllAdoptionRequests>>(
						`/animals/adoptions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
					);
				},
			});

			return await queryClient.fetchQuery(qo);
		},

		async approveFosterRequest(fosterId: string) {
			const resp = await client.request<ApiResponse<null>>(`/animals/fosters/${fosterId}/approve`, {
				method: "POST",
				body: JSON.stringify({}),
			});
			await invalidateCache("all_fosters");
			return resp;
		},

		async terminateFosterRequest(fosterId: string) {
			const resp = await client.request<ApiResponse<null>>(`/animals/fosters/${fosterId}/terminate`, {
				method: "POST",
				body: JSON.stringify({}),
			});
			await invalidateCache("all_fosters");
			return resp;
		},

		async rejectFosterRequest(fosterId: string) {
			const resp = await client.request<ApiResponse<null>>(`/animals/fosters/${fosterId}/reject`, {
				method: "POST",
				body: JSON.stringify({}),
			});
			await invalidateCache("all_fosters");
			return resp;
		},

		async approveAdoptionRequest(fosterId: string) {
			const resp = await client.request<ApiResponse<null>>(`/animals/adoption/${fosterId}/approve`, {
				method: "POST",
				body: JSON.stringify({}),
			});
			await invalidateCache("all_adoptions");
			// TODO: invalidate the user details cache for all of history fetched in the user details query
			return resp;
		},
	};
}
