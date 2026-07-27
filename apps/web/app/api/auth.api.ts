import type { ApiResponse } from "~/types/response";
import type { UserPayload } from "@workspace/auth";
import { createApiClient } from "~/api/client";

export function createAuthApi(client = createApiClient()) {
	return {
		client,

		async me() {
			return await client.request<
				ApiResponse<{
					user: UserPayload;
				}>
			>("/auth/public/me");
		},

		async signIn(data: { email: string; password: string }) {
			return await client.request<
				ApiResponse<{
					user: UserPayload;
				}>
			>("/auth/public/signin", {
				method: "POST",
				body: JSON.stringify(data),
			});
		},

		async signUp(data: {
			email: string;
			password: string;
			fullName: string;
			phone: string;
			address: string;
			role: "foster_volunteer" | "adopter";
			fosterExperience: string;
			availability: string;
			location: string;
		}) {
			return await client.request<
				ApiResponse<{
					user: UserPayload;
				}>
			>("/auth/public/signup", {
				method: "POST",
				body: JSON.stringify(data),
			});
		},

		async logout() {
			return await client.request("/auth/signout", {
				method: "POST",
				body: JSON.stringify({}),
			});
		},
	};
}
