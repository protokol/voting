import Hapi from "@hapi/hapi";

export const Handler = {
	async register(server: Hapi.Server): Promise<void> {
		// CastVoteRoute.register(server, ConfigurationsController);
		// RegistrationRoutes.register(server, RegistrationController);
	},
	name: "Voting API", // TODO: get this from defaults
	version: "1.0.0",
};
