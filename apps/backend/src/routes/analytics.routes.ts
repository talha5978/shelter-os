import { animals, fosters, adoptions, animalMedicalRecords, animalTimeline, users } from "@workspace/db";
import { and, count, desc, eq, gte, isNotNull, lt, ne } from "drizzle-orm";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { adminAuthMiddleware, requireRole } from "~/middlewares/auth.middleware";

export async function analyticsRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/dashboard",
		{ preHandler: [adminAuthMiddleware, requireRole(["admin", "shelter_staff"])] },
		async (_request: FastifyRequest, reply: FastifyReply) => {
			const now = new Date();
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
			const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
			const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

			// TOP 4 METRICS
			const [animalsInShelter] = await fastify.db
				.select({ count: count() })
				.from(animals)
				.where(ne(animals.status, "adopted"));

			const [readyForAdoption] = await fastify.db
				.select({ count: count() })
				.from(animals)
				.where(eq(animals.status, "adoption_ready"));

			const [pendingFosterRequests] = await fastify.db
				.select({ count: count() })
				.from(fosters)
				.where(eq(fosters.status, "applied"));

			const [adoptionsThisMonth] = await fastify.db
				.select({ count: count() })
				.from(adoptions)
				.where(and(isNotNull(adoptions.approvalDate), gte(adoptions.approvalDate, startOfMonth)));

			// Overdue medical checkups
			const [overdueCheckups] = await fastify.db
				.select({ count: count() })
				.from(animalMedicalRecords)
				.where(
					and(
						isNotNull(animalMedicalRecords.nextCheckup),
						lt(animalMedicalRecords.nextCheckup, now),
					),
				);

			// ANIMALS BY STATUS (for chart)
			const statusCounts = await fastify.db
				.select({
					status: animals.status,
					count: count(),
				})
				.from(animals)
				.groupBy(animals.status);

			const animalsByStatus = {
				rescued: 0,
				intake: 0,
				medical: 0,
				foster: 0,
				adoption_ready: 0,
				adopted: 0,
			};

			for (const row of statusCounts) {
				if (row.status in animalsByStatus) {
					animalsByStatus[row.status as keyof typeof animalsByStatus] = Number(row.count);
				}
			}

			// LINE CHART DATA (status over time)
			// Last 14 days of timeline events grouped by date + eventType
			const fourteenDaysAgoDate = new Date(now);
			fourteenDaysAgoDate.setDate(fourteenDaysAgoDate.getDate() - 13);
			fourteenDaysAgoDate.setHours(0, 0, 0, 0);

			const timelineEvents = await fastify.db
				.select({
					eventType: animalTimeline.eventType,
					eventDate: animalTimeline.eventDate,
				})
				.from(animalTimeline)
				.where(gte(animalTimeline.eventDate, fourteenDaysAgoDate))
				.orderBy(animalTimeline.eventDate);

			// Build date keys for last 14 days
			const lineChartData: Record<
				string,
				{
					date: string;
					rescued: number;
					intake: number;
					medical: number;
					foster: number;
					adoption_ready: number;
					adopted: number;
				}
			> = {};

			for (let i = 13; i >= 0; i--) {
				const d = new Date(now);
				d.setDate(d.getDate() - i);
				const key = d.toISOString().slice(0, 10);
				lineChartData[key] = {
					date: key,
					rescued: 0,
					intake: 0,
					medical: 0,
					foster: 0,
					adoption_ready: 0,
					adopted: 0,
				};
			}

			for (const event of timelineEvents) {
				const key = new Date(event.eventDate).toISOString().slice(0, 10);
				if (!lineChartData[key]) continue;

				const type = event.eventType;
				if (type === "rescued") lineChartData[key].rescued += 1;
				else if (type === "intake") lineChartData[key].intake += 1;
				else if (type === "medical_checkup" || type === "vaccinated") lineChartData[key].medical += 1;
				else if (type === "fostered") lineChartData[key].foster += 1;
				else if (type === "adopted") lineChartData[key].adopted += 1;
			}

			const statusOverTime = Object.values(lineChartData);

			// RECENT ACTIVITY
			const recentActivity = await fastify.db
				.select({
					id: animalTimeline.id,
					eventType: animalTimeline.eventType,
					description: animalTimeline.description,
					eventDate: animalTimeline.eventDate,
					animalId: animals.id,
					animalName: animals.name,
					animalCode: animals.animalId,
				})
				.from(animalTimeline)
				.leftJoin(animals, eq(animalTimeline.animalId, animals.id))
				.orderBy(desc(animalTimeline.eventDate))
				.limit(8);

			// NEEDS ATTENTION

			// Overdue checkups
			const overdueMedical = await fastify.db
				.select({
					animalId: animals.id,
					animalName: animals.name,
					animalCode: animals.animalId,
					nextCheckup: animalMedicalRecords.nextCheckup,
				})
				.from(animalMedicalRecords)
				.innerJoin(animals, eq(animalMedicalRecords.animalId, animals.id))
				.where(
					and(
						isNotNull(animalMedicalRecords.nextCheckup),
						lt(animalMedicalRecords.nextCheckup, now),
					),
				)
				.orderBy(animalMedicalRecords.nextCheckup)
				.limit(10);

			// Foster applications waiting > 3 days
			const staleFosterApplications = await fastify.db
				.select({
					id: fosters.id,
					createdAt: fosters.createdAt,
					animalId: animals.id,
					animalName: animals.name,
					animalCode: animals.animalId,
					userId: users.id,
					userName: users.fullName,
				})
				.from(fosters)
				.leftJoin(animals, eq(fosters.animalId, animals.id))
				.leftJoin(users, eq(fosters.userId, users.id))
				.where(and(eq(fosters.status, "applied"), lt(fosters.createdAt, threeDaysAgo)))
				.orderBy(fosters.createdAt)
				.limit(10);

			// Animals stuck in medical too long (> 14 days)
			const stuckInMedical = await fastify.db
				.select({
					id: animals.id,
					name: animals.name,
					animalId: animals.animalId,
					status: animals.status,
					updatedAt: animals.updatedAt,
				})
				.from(animals)
				.where(and(eq(animals.status, "medical"), lt(animals.updatedAt, fourteenDaysAgo)))
				.orderBy(animals.updatedAt)
				.limit(10);

			// QUICK STATS
			const [activeFosters] = await fastify.db
				.select({ count: count() })
				.from(fosters)
				.where(eq(fosters.status, "active"));

			const [totalAdopters] = await fastify.db
				.select({ count: count() })
				.from(users)
				.where(eq(users.role, "adopter"));

			// Average days from intake → adoption (approved only)
			const adoptionDurations = await fastify.db
				.select({
					intakeDate: animals.intakeDate,
					approvalDate: adoptions.approvalDate,
				})
				.from(adoptions)
				.innerJoin(animals, eq(adoptions.animalId, animals.id))
				.where(and(isNotNull(adoptions.approvalDate), isNotNull(animals.intakeDate)));

			let avgDaysToAdoption: number | null = null;
			if (adoptionDurations.length > 0) {
				const totalDays = adoptionDurations.reduce((sum, row) => {
					const intake = new Date(row.intakeDate!).getTime();
					const approved = new Date(row.approvalDate!).getTime();
					return sum + (approved - intake) / (1000 * 60 * 60 * 24);
				}, 0);
				avgDaysToAdoption = Math.round(totalDays / adoptionDurations.length);
			}

			// RESPONSE
			return reply.success(
				{
					metrics: {
						animalsInShelter: Number(animalsInShelter.count),
						readyForAdoption: Number(readyForAdoption.count),
						pendingFosterRequests: Number(pendingFosterRequests.count),
						adoptionsThisMonth: Number(adoptionsThisMonth.count),
						overdueCheckups: Number(overdueCheckups.count),
					},
					animalsByStatus,
					statusOverTime,
					recentActivity,
					needsAttention: {
						overdueMedical,
						staleFosterApplications,
						stuckInMedical,
					},
					quickStats: {
						activeFosters: Number(activeFosters.count),
						totalAdopters: Number(totalAdopters.count),
						avgDaysToAdoption,
					},
				},
				"Dashboard data fetched successfully",
			);
		},
	);
}
