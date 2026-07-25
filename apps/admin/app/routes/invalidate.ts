import type { LoaderFunctionArgs } from "react-router";
import { queryClient } from "~/lib/tanstackQueryClient";

export const action = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const key = url.searchParams.get("key")?.trim() ?? "";
	await queryClient.invalidateQueries({ queryKey: [key] });
};
