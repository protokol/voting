import { Controller } from "@arkecosystem/core-api";
import Hapi from "@hapi/hapi";

import { CastVoteController } from "../controllers";

export const register = (server: Hapi.Server, castVoteController: Controller): void => {
	const controller: CastVoteController = server.app.app.resolve(castVoteController);

	server.bind(controller);

	server.route({
		method: "GET",
		path: "/cast/vote/transactions",
		handler: (request: Hapi.Request) => () => controller.transactions(request),
		options: {
			plugins: {
				pagination: {
					enabled: true,
				},
			},
		},
	});

	server.route({
		method: "GET",
		path: "/cast/vote/transactions/${id}",
		handler: (request: Hapi.Request) => () => controller.transaction(request),
		options: {},
	});

	server.route({
		method: "GET",
		path: "/cast/vote/${id}/wallet",
		handler: (request: Hapi.Request) => () => controller.wallet(request),
		options: {},
	});
};
