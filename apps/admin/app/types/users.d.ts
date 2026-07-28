import type { MediaAsset, Species, User, UserRole } from "@workspace/db";

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

export type UserDetails = {
	user: {
		role: UserRole;
		id: string;
		email: string;
		fullName: string;
		phone: string | null;
		address: string | null;
		avatarUrl: MediaAsset | null;
		fosterExperience: string | null;
		availability: string | null;
		location: string | null;
		isVerified: boolean | null;
		createdAt: Date;
	};
	fosterHistory: {
		id: string;
		status: string | null;
		startDate: Date | null;
		endDate: Date | null;
		matchScore: number | null;
		notes: string | null;
		createdAt: Date;
		animalId: string | null;
		animalCode: string | null;
		animalName: string | null;
		animalSpecies: Species | null;
		animalBreed: string | null;
		animalPhotos: MediaAsset[];
	}[];
	adoptionHistory: {
		id: string;
		applicationDate: Date;
		approvalDate: Date | null;
		matchScore: number | null;
		notes: string | null;
		animalId: string | null;
		animalCode: string | null;
		animalName: string | null;
		animalSpecies: Species | null;
		animalBreed: string | null;
		animalPhotos: MediaAsset[];
	}[];
};
