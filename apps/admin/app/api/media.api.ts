import type { ApiResponse } from "~/types/response";
import { createApiClient } from "~/api/client";

export function createMediaApi(client = createApiClient()) {
	return {
		client,

		async upload(file: File, opts: { width?: number; height?: number } = {}) {
			const formData = new FormData();
			formData.append("file", file);

			const queryParams = new URLSearchParams();
			queryParams.set("width", opts.width?.toString() || "400");
			queryParams.set("height", opts.height?.toString() || "400");

			return await client.request<
				ApiResponse<{
					url: string;
					publicId: string;
				}>
			>("/media/upload?" + queryParams.toString(), {
				method: "POST",
				body: formData,
			});
		},

		async delete(publicId: string) {
			return await client.request<ApiResponse<null>>("/media/delete", {
				method: "DELETE",
				body: JSON.stringify({ publicId }),
			});
		},
	};
}
