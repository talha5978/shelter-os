export const invalidateCache = async (key: string) => {
	await fetch(`/invalidate?key=${key}`, { method: "POST" });
};

export const invalidateAllCache = async () => {
	await fetch(`/invalidate`, { method: "POST" });
};
