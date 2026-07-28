import type { AnimalStatus } from "@workspace/db";

export type DashboardAnalytics = {
	metrics: {
		animalsInShelter: number;
		readyForAdoption: number;
		pendingFosterRequests: number;
		adoptionsThisMonth: number;
		overdueCheckups: number;
	};
	animalsByStatus: {
		rescued: number;
		intake: number;
		medical: number;
		foster: number;
		adoption_ready: number;
		adopted: number;
	};
	statusOverTime: {
		date: string;
		rescued: number;
		intake: number;
		medical: number;
		foster: number;
		adoption_ready: number;
		adopted: number;
	}[];
	recentActivity: {
		id: string;
		eventType: string;
		description: string;
		eventDate: Date;
		animalId: string | null;
		animalName: string | null;
		animalCode: string | null;
	}[];
	needsAttention: {
		overdueMedical: {
			animalId: string;
			animalName: string | null;
			animalCode: string;
			nextCheckup: Date | null;
		}[];
		staleFosterApplications: {
			id: string;
			createdAt: Date;
			animalId: string | null;
			animalName: string | null;
			animalCode: string | null;
			userId: string | null;
			userName: string | null;
		}[];
		stuckInMedical: {
			id: string;
			name: string | null;
			animalId: string;
			status: AnimalStatus;
			updatedAt: Date;
		}[];
	};
	quickStats: {
		activeFosters: number;
		totalAdopters: number;
		avgDaysToAdoption: number | null;
	};
};
