import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	layout("./routes/layout.tsx", [
		index("routes/home.tsx"),
		route("stories/max-new-begining", "./routes/stories/story_1.tsx"),
		route("stories/whiskers-quiet-haven", "./routes/stories/story_2.tsx"),
		route("stories/olivers-golden-years", "./routes/stories/story_3.tsx"),
		route("stories/the-window-seat-duo", "./routes/stories/story_4.tsx"),
		route("donate", "./routes/donations.tsx"),
	]),
] satisfies RouteConfig;
