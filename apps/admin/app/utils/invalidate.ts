export const invalidateCache = async (key: string) => {
	await fetch(`/invalidate?key=${key}`, { method: "POST" });
};
