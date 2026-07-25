import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
	layout("./routes/public-layout.tsx", [route("sign-in", "./routes/Auth/SignIn.tsx")]),

	layout("./routes/protected-layout.tsx", [
		index("./routes/home.tsx"),

		...prefix("animals", [
			index("./routes/Animals/animals.tsx"),
			route("add", "./routes/Animals/add-animal.tsx"),
			route(":animalId/medical-records", "./routes/Animals/medical-records.tsx"),
		]),

		route("invalidate", "./routes/invalidate.ts"),
	]),
] satisfies RouteConfig;
