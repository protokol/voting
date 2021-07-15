import { Controller } from "@arkecosystem/core-api";
import Hapi from "@hapi/hapi";

import { CreateProposalController } from "../controllers";

export const register = (server: Hapi.Server, createProposalController: typeof Controller): void => {
	const controller: CreateProposalController = server.app.app.resolve(createProposalController);

	server.bind(controller);

	server.route({
		method: "GET",
		path: "/create/proposal/transactions",
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
		path: "/create/proposal/transactions/${id}",
		handler: (request: Hapi.Request) => () => controller.transaction(request),
		options: {},
	});

	server.route({
		method: "GET",
		path: "/create/proposal/${id}/wallet",
		handler: (request: Hapi.Request) => () => controller.wallet(request),
		options: {},
	});
};
