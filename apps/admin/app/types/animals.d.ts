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

export type AllMedicalRecordsResp = {
	animals: {
		id: string;
		animalId: string;
		name: string | null;
		photos: MediaAsset[] | null;
		species: Species;
		nextCheckup: Date | null;
		activeConditions: string[];
		conditionsCount: number;
		checkupStatus: "overdue" | "upcoming" | "none";
		updatedAt: Date;
	}[];
	stats: {
		total: number;
		overdue: number;
		upcoming: number;
	};
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
};

export type AllFosterRequests = {
	fosters: {
		id: string;
		status: string | null;
		startDate: Date | null;
		endDate: Date | null;
		matchScore: number | null;
		notes: string | null;
		createdAt: Date;
		updatedAt: Date;
		userId: string | null;
		fullName: string | null;
		email: string | null;
		phone: string | null;
		address: string | null;
		availability: string | null;
		location: string | null;
		animalId: string | null;
		animalCode: string | null;
		animalName: string | null;
		animalBreed: string | null;
		animalSpecies: Species | null;
		animalPhotos: MediaAsset[] | null;
		animalStatus: AnimalStatus | null;
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
