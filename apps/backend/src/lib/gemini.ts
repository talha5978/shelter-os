import { GoogleGenAI } from "@google/genai";
import type { ServiceResponse } from "~/types/response";

export type FosterProfileInput = {
	fullName?: string;
	availability?: string | null;
	location?: string | null;
	fosterExperience: string | null;
};

export type AnimalProfileInput = {
	name?: string | null;
	species: string;
	breed?: string | null;
	age?: number | string | null;
	gender?: string | null;
	personality?: string | null;
	description?: string | null;
	conditions?: string[];
};

export type FosterMatchResult = {
	matchScore: number;
	recommendation: "strong" | "moderate" | "weak" | "not_recommended";
	summary: string;
	strengths: string[];
	concerns: string[];
	suggestedQuestions: string[];
};

export type BatchAnimalInput = AnimalProfileInput & {
	id: string;
};

export type BatchFosterMatchResult = {
	animalId: string;
	matchScore: number;
	recommendation: "strong" | "moderate" | "weak" | "not_recommended";
	summary: string;
	strengths: string[];
	concerns: string[];
};

export class GeminiService {
	private readonly client: GoogleGenAI;

	constructor(apiKey: string) {
		if (!apiKey) {
			throw new Error("Gemini API key is required");
		}
		this.client = new GoogleGenAI({ apiKey });
	}

	private parseFosterExperience(raw: string | null) {
		if (!raw) return {};

		const get = (key: string) => {
			const match = raw.match(new RegExp(`\\[${key}:([^\\]]+)\\]`));
			return match?.[1] || null;
		};

		return {
			experience: get("experience"),
			duration: get("duration"),
			species: get("species"),
			housing: get("housing"),
			fencedYard: get("fencedYard"),
			activityLevel: get("activityLevel"),
			hasKids: get("hasKids"),
			hasOtherPets: get("hasOtherPets"),
			specialNeeds: get("specialNeeds"),
			maxAnimals: get("maxAnimals"),
		};
	}

	async scoreFosterRequest(
		foster: FosterProfileInput,
		animal: AnimalProfileInput,
	): Promise<ServiceResponse<FosterMatchResult>> {
		try {
			const parsedFoster = this.parseFosterExperience(foster.fosterExperience);

			const prompt = `
You are an expert animal shelter matching assistant.
Score how suitable this foster volunteer is for this specific animal.

Return ONLY valid JSON matching the schema.

SCORING RULES:
- Score from 0 to 100
- Consider species preference, experience level, housing, kids, other pets, activity level, special needs ability, and availability duration
- Be practical and conservative with high-energy, medical, or special-needs animals
- Give clear strengths and concerns

FOSTER PROFILE:
- Availability: ${foster.availability || "unknown"}
- Location: ${foster.location || "unknown"}
- Experience level: ${parsedFoster.experience || "unknown"}
- Preferred foster duration: ${parsedFoster.duration || "unknown"}
- Preferred species: ${parsedFoster.species || "unknown"}
- Housing: ${parsedFoster.housing || "unknown"}
- Has fenced yard: ${parsedFoster.fencedYard || "unknown"}
- Activity level preference: ${parsedFoster.activityLevel || "unknown"}
- Children at home: ${parsedFoster.hasKids || "unknown"}
- Other pets: ${parsedFoster.hasOtherPets || "unknown"}
- Special needs experience: ${parsedFoster.specialNeeds || "unknown"}
- Max animals they can foster: ${parsedFoster.maxAnimals || "unknown"}

ANIMAL PROFILE:
- Name: ${animal.name || "Unknown"}
- Species: ${animal.species}
- Breed: ${animal.breed || "unknown"}
- Age: ${animal.age ?? "unknown"}
- Gender: ${animal.gender || "unknown"}
- Personality: ${animal.personality || "unknown"}
- Description: ${animal.description || "unknown"}
- Known conditions: ${(animal.conditions || []).join(", ") || "None listed"}
`.trim();

			const response = await this.client.models.generateContent({
				model: "gemini-2.5-flash",
				contents: prompt,
				config: {
					responseMimeType: "application/json",
					temperature: 0.3,
					responseSchema: {
						type: "OBJECT",
						properties: {
							matchScore: {
								type: "NUMBER",
								description: "Compatibility score from 0 to 100",
							},
							recommendation: {
								type: "STRING",
								enum: ["strong", "moderate", "weak", "not_recommended"],
							},
							summary: {
								type: "STRING",
								description: "1-2 sentence overall assessment",
							},
							strengths: {
								type: "ARRAY",
								items: { type: "STRING" },
							},
							concerns: {
								type: "ARRAY",
								items: { type: "STRING" },
							},
							suggestedQuestions: {
								type: "ARRAY",
								items: { type: "STRING" },
							},
						},
						required: [
							"matchScore",
							"recommendation",
							"summary",
							"strengths",
							"concerns",
							"suggestedQuestions",
						],
					},
				},
			});

			if (!response.text) {
				return {
					success: false,
					error: {
						code: "EMPTY_RESPONSE",
						message: "Gemini returned an empty response",
					},
				};
			}

			const result = JSON.parse(response.text) as FosterMatchResult;

			result.matchScore = Math.max(0, Math.min(100, Number(result.matchScore) || 0));

			return {
				success: true,
				data: result,
			};
		} catch (error) {
			return {
				success: false,
				error: {
					code: "GEMINI_ERROR",
					message: "Failed to score foster request",
					details: error,
				},
			};
		}
	}

	async scoreFosterRequestBatch(
		foster: FosterProfileInput,
		animalsList: BatchAnimalInput[],
	): Promise<ServiceResponse<BatchFosterMatchResult[]>> {
		try {
			if (!animalsList.length) {
				return { success: true, data: [] };
			}

			const parsedFoster = this.parseFosterExperience(foster.fosterExperience);

			const animalsJson = animalsList.map((animal) => ({
				id: animal.id,
				name: animal.name || "Unknown",
				species: animal.species,
				breed: animal.breed || "unknown",
				age: animal.age ?? "unknown",
				gender: animal.gender || "unknown",
				personality: animal.personality || "unknown",
				description: animal.description || "unknown",
				conditions: animal.conditions || [],
			}));

			const prompt = `
	You are an expert animal shelter matching assistant.
	Score how suitable this foster volunteer is for EACH animal in the list.
	
	Return ONLY valid JSON:
	{
	  "results": [
		{
		  "animalId": "string",
		  "matchScore": 0-100,
		  "recommendation": "strong" | "moderate" | "weak" | "not_recommended",
		  "summary": "1-2 sentence assessment",
		  "strengths": ["..."],
		  "concerns": ["..."]
		}
	  ]
	}
	
	SCORING RULES:
	- Score from 0 to 100
	- Consider species preference, experience, housing, kids, other pets, activity level, special needs, availability
	- Be practical and conservative with high-energy or special-needs animals
	- You MUST return one result for every animal id provided
	- Keep summaries short
	
	FOSTER PROFILE:
	- Availability: ${foster.availability || "unknown"}
	- Location: ${foster.location || "unknown"}
	- Experience level: ${parsedFoster.experience || "unknown"}
	- Preferred foster duration: ${parsedFoster.duration || "unknown"}
	- Preferred species: ${parsedFoster.species || "unknown"}
	- Housing: ${parsedFoster.housing || "unknown"}
	- Has fenced yard: ${parsedFoster.fencedYard || "unknown"}
	- Activity level preference: ${parsedFoster.activityLevel || "unknown"}
	- Children at home: ${parsedFoster.hasKids || "unknown"}
	- Other pets: ${parsedFoster.hasOtherPets || "unknown"}
	- Special needs experience: ${parsedFoster.specialNeeds || "unknown"}
	- Max animals they can foster: ${parsedFoster.maxAnimals || "unknown"}
	
	ANIMALS TO SCORE (JSON):
	${JSON.stringify(animalsJson, null, 2)}
	`.trim();

			const response = await this.client.models.generateContent({
				model: "gemini-2.5-flash",
				contents: prompt,
				config: {
					responseMimeType: "application/json",
					temperature: 0.3,
					responseSchema: {
						type: "OBJECT",
						properties: {
							results: {
								type: "ARRAY",
								items: {
									type: "OBJECT",
									properties: {
										animalId: { type: "STRING" },
										matchScore: { type: "NUMBER" },
										recommendation: {
											type: "STRING",
											enum: ["strong", "moderate", "weak", "not_recommended"],
										},
										summary: { type: "STRING" },
										strengths: {
											type: "ARRAY",
											items: { type: "STRING" },
										},
										concerns: {
											type: "ARRAY",
											items: { type: "STRING" },
										},
									},
									required: [
										"animalId",
										"matchScore",
										"recommendation",
										"summary",
										"strengths",
										"concerns",
									],
								},
							},
						},
						required: ["results"],
					},
				},
			});

			if (!response.text) {
				return {
					success: false,
					error: {
						code: "EMPTY_RESPONSE",
						message: "Gemini returned an empty response",
					},
				};
			}

			const parsed = JSON.parse(response.text) as {
				results: BatchFosterMatchResult[];
			};

			const normalized = (parsed.results || []).map((item) => ({
				...item,
				matchScore: Math.max(0, Math.min(100, Number(item.matchScore) || 0)),
				strengths: item.strengths || [],
				concerns: item.concerns || [],
			}));

			return {
				success: true,
				data: normalized,
			};
		} catch (error) {
			return {
				success: false,
				error: {
					code: "GEMINI_ERROR",
					message: "Failed to batch score foster requests",
					details: error,
				},
			};
		}
	}
}
