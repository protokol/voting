import Hapi from "@hapi/hapi";

import { CastVoteController, CreateProposalController } from "./controllers";
import { ConfigurationsController } from "./controllers/configurations";
import * as CastVoteRoutes from "./routes/cast-vote";
import * as ConfigurationsRoutes from "./routes/configurations";
import * as CreateProposalRoutes from "./routes/create-proposal";

export const Handler = {
	async register(server: Hapi.Server): Promise<void> {
		ConfigurationsRoutes.register(server, ConfigurationsController);
		CastVoteRoutes.register(server, CastVoteController);
		CreateProposalRoutes.register(server, CreateProposalController);
	},
	name: "Voting API", // TODO: get this from defaults
	version: "1.0.0",
};
