import Hapi from "@hapi/hapi";

import { CastVoteController, CreateProposalController, StatisticsController } from "./controllers";
import { ConfigurationsController } from "./controllers/configurations";
import * as CastVoteRoutes from "./routes/cast-vote";
import * as ConfigurationsRoutes from "./routes/configurations";
import * as CreateProposalRoutes from "./routes/create-proposal";
import * as StatisticsRoutes from "./routes/statistics";

export const Handler = {
	async register(server: Hapi.Server): Promise<void> {
		ConfigurationsRoutes.register(server, ConfigurationsController);
		CastVoteRoutes.register(server, CastVoteController);
		CreateProposalRoutes.register(server, CreateProposalController);
		StatisticsRoutes.register(server, StatisticsController);
	},
	name: "Voting API", // TODO: get this from defaults
	version: "1.0.0",
};
