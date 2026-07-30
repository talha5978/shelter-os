import type { Species } from "@workspace/db";
import { useLoaderData, useSearchParams, type LoaderFunctionArgs } from "react-router";
import { createAnimalsApi } from "~/api/animals.api";
import { createApiClient } from "~/api/client";
import AnimalsGrid from "~/components/AnimalsGrid";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const cookieHeader = request.headers.get("Cookie") ?? "";
	const client = createApiClient();
	client.setCookie(cookieHeader);

	const url = new URL(request.url);
	const q = url.searchParams.get("q")?.trim() ?? "";
	const pageParam = Number(url.searchParams.get("page") ?? String(1));
	const sizeParam = Number(url.searchParams.get("size") ?? String(12));
	const speciesParam = url.searchParams.get("species")?.trim() ?? "";

	const pageIndex = Math.max(0, pageParam - 1);
	const pageSize = Math.max(1, sizeParam);

	const animalsApi = createAnimalsApi(client);

	const data = await animalsApi.getAnimals({
		search: q,
		pageIndex: String(pageIndex),
		pageSize: String(pageSize),
		species: speciesParam,
	});

	const animalId = url.searchParams.get("animalId")?.trim() ?? "";
	let animalProfile = null;
	if (animalId) {
		animalProfile = await animalsApi.getAnimalProfile(animalId);
	}

	const recommendedAnimals = await animalsApi.getRecommendedAnimals();
	if (recommendedAnimals.success) {
		for (let i = 0; i < recommendedAnimals.data.recommended.length; i++) {
			recommendedAnimals.data.recommended[i] = recommendedAnimals.data.recommended[i];
		}
	}

	// console.dir(recommendedAnimals.success ? recommendedAnimals.data.recommended.length + " FOUND...." : "NO FUCKING DATA FOUND");

	return { data, status: params.status, animalProfile, recommendedAnimals };
};

export default function Animals() {
	const loaderData = useLoaderData<typeof loader>();
	const data = loaderData?.data.success ? loaderData.data.data : null;

	const [_, setSearchParams] = useSearchParams();

	const handlePageChange = (newPage: number) => {
		setSearchParams((prev) => {
			prev.set("page", String(newPage));
			return prev;
		});
	};

	const handleSearchChange = (query: string) => {
		setSearchParams((prev) => {
			if (query.trim()) {
				prev.set("q", query.trim());
			} else {
				prev.delete("q");
			}
			// Reset to page 1 whenever search query changes
			prev.set("page", "1");
			return prev;
		});
	};

	const handleSpeciesChange = (speciesList: Species[]) => {
		setSearchParams((prev) => {
			if (speciesList.length > 0) {
				prev.set("species", speciesList.join(","));
			} else {
				prev.delete("species");
			}
			// Reset to page 1 whenever species filter changes
			prev.set("page", "1");
			return prev;
		});
	};

	return (
		<div className="pb-10">
			{data && (
				<AnimalsGrid
					data={data}
					onPageChange={handlePageChange}
					onSearchChange={handleSearchChange}
					onSpeciesChange={handleSpeciesChange}
					animalProfile={
						loaderData?.animalProfile == null
							? null
							: loaderData.animalProfile.success
								? loaderData.animalProfile.data
								: null
					}
					recommendedAnimals={
						loaderData?.recommendedAnimals.success
							? loaderData.recommendedAnimals.data.recommended
							: []
					}
				/>
			)}
		</div>
	);
}
