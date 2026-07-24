import type { AnimalStatus, Gender, MediaAsset, Species } from "@workspace/db";

export type AllAnimalsResponse = {
	animals: {
		id: string;
		animalId: string;
		name: string | null;
		species: Species;
		breed?: string | null;
		age?: string | null;
		gender?: Gender | null;
		status: AnimalStatus;
		description: string | null;
		photos?: MediaAsset[] | null;
	}[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
};
