import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	uniqueIndex,
	pgEnum,
	index,
	integer,
	decimal,
	jsonb,
} from "drizzle-orm/pg-core";

// ====================== ENUMS ======================
export const userRoleEnum = pgEnum("user_role", ["shelter_staff", "foster_volunteer", "adopter", "admin"]);

export const animalStatusEnum = pgEnum("animal_status", [
	"rescued",
	"intake",
	"medical",
	"foster",
	"adoption_ready",
	"adopted",
]);

export const genderEnum = pgEnum("gender", ["male", "female", "unknown"]);

export const speciesEnum = pgEnum("species", ["dog", "cat", "bird", "rabbit", "reptile", "other"]);

// ====================== TABLES ======================

export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		email: text("email").notNull().unique(),
		password: text("password").notNull(),
		fullName: text("full_name").notNull(),
		phone: text("phone"),
		address: text("address"),
		avatarUrl: jsonb("avatar_url"),

		role: userRoleEnum("role").notNull().default("adopter"),

		// For fosters/volunteers
		fosterExperience: text("foster_experience"), // e.g. "beginner", "intermediate", ...
		availability: text("availability"), // e.g. "2 weeks"
		location: text("location"), // for matching

		isVerified: boolean("is_verified").default(false),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("users_role_idx").on(table.role)],
);

export const animals = pgTable(
	"animals",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		animalId: text("animal_id").notNull().unique(), // e.g. DOG-1024

		name: text("name"),
		species: speciesEnum("species").notNull().default("other"),
		breed: text("breed"),
		age: integer("age"), // in years or months? consider adding unit
		gender: genderEnum("gender").default("unknown"),
		weight: decimal("weight", { precision: 5, scale: 2 }), // kg

		foundLocation: text("found_location"),
		rescueDate: timestamp("rescue_date", { withTimezone: true }),
		intakeDate: timestamp("intake_date", { withTimezone: true }),

		status: animalStatusEnum("status").notNull().default("rescued"),

		description: text("description"),
		personality: text("personality"),

		photos: jsonb("photos").default([]),
		videos: jsonb("videos").default([]),

		createdBy: uuid("created_by")
			.references(() => users.id)
			.notNull(), // shelter staff

		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("animals_status_idx").on(table.status), index("animals_species_idx").on(table.species)],
);

export const animalMedicalRecords = pgTable(
	"animal_medical_records",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		animalId: uuid("animal_id")
			.references(() => animals.id, { onDelete: "cascade" })
			.notNull(),

		vaccines: jsonb("vaccines").default([]), // e.g. [{name: "Rabies", date: "..."}]
		medications: jsonb("medications").default([]),
		conditions: text("conditions").array(),
		nextCheckup: timestamp("next_checkup", { withTimezone: true }),

		notes: text("notes"),

		createdBy: uuid("created_by")
			.references(() => users.id)
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("medical_animal_idx").on(table.animalId)],
);

export const animalTimeline = pgTable(
	"animal_timeline",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		animalId: uuid("animal_id")
			.references(() => animals.id, { onDelete: "cascade" })
			.notNull(),

		eventType: text("event_type").notNull(), // e.g. "rescued", "vaccinated", "fostered"
		description: text("description").notNull(),
		eventDate: timestamp("event_date", { withTimezone: true }).defaultNow().notNull(),

		metadata: jsonb("metadata"), // extra details

		createdBy: uuid("created_by").references(() => users.id),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("timeline_animal_idx").on(table.animalId)],
);

export const fosters = pgTable(
	"fosters",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),

		animalId: uuid("animal_id")
			.references(() => animals.id, { onDelete: "cascade" })
			.notNull(),

		startDate: timestamp("start_date", { withTimezone: true }).notNull(),
		endDate: timestamp("end_date", { withTimezone: true }),

		status: text("status").default("active"), // active, completed, etc.

		matchScore: integer("match_score"), // 0-100

		notes: text("notes"),

		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("fosters_unique").on(table.userId, table.animalId),
		index("fosters_animal_idx").on(table.animalId),
		index("fosters_user_idx").on(table.userId),
	],
);

export const adoptions = pgTable(
	"adoptions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		animalId: uuid("animal_id")
			.references(() => animals.id, { onDelete: "cascade" })
			.notNull(),
		adopterId: uuid("adopter_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),

		applicationDate: timestamp("application_date", { withTimezone: true }).defaultNow().notNull(),
		approvalDate: timestamp("approval_date", { withTimezone: true }),

		matchScore: integer("match_score"),

		notes: text("notes"),

		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("adoptions_animal_idx").on(table.animalId)],
);

export const schema = {
	userRoleEnum,
	animalStatusEnum,
	genderEnum,
	speciesEnum,
	users,
	animals,
	animalMedicalRecords,
	animalTimeline,
	fosters,
	adoptions,
} as const;
