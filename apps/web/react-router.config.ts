import type { Config } from "@react-router/dev/config";

export default {
	ssr: true,
	prerender: () => {
		return [
			"stories/max-new-begining",
			"stories/whiskers-quiet-haven",
			"stories/olivers-golden-years",
			"stories/the-window-seat-duo",
			"donate",
		];
	},
} satisfies Config;
