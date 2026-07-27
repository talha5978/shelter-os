import type { AnimalStatus, Gender, MediaAsset, Species } from "@workspace/db";

export type AnimalsResponse = {
	animals: {
		id: string;
		animalId: string;
		name: string | null;
		species: Species;
		breed: string | null;
		age: string | null;
		gender: Gender | null;
		weight: string | null;
		description: string | null;
		personality: string | null;
		photos: MediaAsset[] | null;
		status: AnimalStatus;
		createdAt: Date;
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
