import { Controller } from "@arkecosystem/core-api";
import Hapi from "@hapi/hapi";
import Joi from "joi";

import { StatisticsController } from "../controllers";

export const register = (server: Hapi.Server, statisticsController: typeof Controller): void => {
	const controller: StatisticsController = server.app.app.resolve(statisticsController);

	server.bind(controller);

	server.route({
		method: "GET",
		path: "/statistics/{id}",
		handler: (request: Hapi.Request) => controller.statistics(request),
		options: {
			validate: {
				params: Joi.object({
					id: Joi.string().hex().length(64),
				}),
			},
		},
	});
};
