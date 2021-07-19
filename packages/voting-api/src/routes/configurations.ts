import { Controller } from "@arkecosystem/core-api";
import Hapi from "@hapi/hapi";

import { ConfigurationsController } from "../controllers/configurations";

export const register = (server: Hapi.Server, configurationsController: typeof Controller): void => {
	const controller: ConfigurationsController = server.app.app.resolve(configurationsController);

	server.bind(controller);

	server.route({
		method: "GET",
		path: "/configurations",
		handler: () => controller.index(),
		options: {},
	});
};
