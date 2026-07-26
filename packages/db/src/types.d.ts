import { type InferInsertModel, type InferSelectModel, InferEnum } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { schema as db } from "./schema";

export type DbClient = PostgresJsDatabase<typeof db>;

// ====================== ENUM TYPES ======================
export type UserRole = InferEnum<typeof db.userRoleEnum>;
export type AnimalStatus = InferEnum<typeof db.animalStatusEnum>;
export type Gender = InferEnum<typeof db.genderEnum>;
export type Species = InferEnum<typeof db.speciesEnum>;

// ====================== TABLE TYPES ======================

// Users
export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof db.users>;

// Animals
export type Animal = InferSelectModel<typeof db.animals>;
export type NewAnimal = InferInsertModel<typeof db.animals>;

// Adoptions
export type Adoption = InferSelectModel<typeof db.adoptions>;
export type NewAdoption = InferInsertModel<typeof db.adoptions>;

// Timeline
export type AnimalTimeline = InferSelectModel<typeof db.animalTimeline>;
export type NewAnimalTimeline = InferInsertModel<typeof db.animalTimeline>;

// Fosters
export type Foster = InferSelectModel<typeof db.fosters>;
export type NewFoster = InferInsertModel<typeof db.fosters>;

// Medical Records
export type MedicalRecord = InferSelectModel<typeof db.animalMedicalRecords> & {
	vaccines?: Vaccine[];
	medications?: Medication[];
};
export type NewMedicalRecord = InferInsertModel<typeof db.animalMedicalRecords>;

// Custom MediaAsset Type
export type MediaAsset = {
	publicId: string;
	url: string;
	dataType: "img" | "video" | "pdf";
};

// Custom Vaccine Type
export type Vaccine = {
	name: string;
	date: Date;
	description?: string | null;
};

export type Medication = {
	name: string;
	dosage: string;
	frequency?: string | null;
	startDate?: Date | null;
	endDate?: Date | null;
};

export type TimelineMetaData = {
	location?: string;
	associatedPerson?: string;
	referenceCodeOrBatch?: string;
	numericValue?: number;
};
