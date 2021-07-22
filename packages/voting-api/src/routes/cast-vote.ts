import { Controller, Schemas } from "@arkecosystem/core-api";
import Hapi from "@hapi/hapi";
import Joi from "joi";

import { CastVoteController } from "../controllers";

export const register = (server: Hapi.Server, castVoteController: typeof Controller): void => {
	const controller: CastVoteController = server.app.app.resolve(castVoteController);

	server.bind(controller);

	server.route({
		method: "GET",
		path: "/cast/vote/transactions",
		handler: (request: Hapi.Request) => controller.transactions(request),
		options: {
			validate: {
				query: Joi.object({
					orderBy: server.app.schemas.orderBy,
					transform: Joi.bool().default(true),
				}).concat(Schemas.pagination),
			},
			plugins: {
				pagination: {
					enabled: true,
				},
			},
		},
	});

	server.route({
		method: "GET",
		path: "/cast/vote/transactions/{id}",
		handler: (request: Hapi.Request) => controller.transaction(request),
		options: {
			validate: {
				query: Joi.object({
					transform: Joi.bool().default(true),
				}),
				params: Joi.object({
					id: Joi.string().hex().length(64),
				}),
			},
		},
	});

	server.route({
		method: "GET",
		path: "/cast/vote/{id}/wallet",
		handler: (request: Hapi.Request) => controller.wallet(request),
		options: {
			validate: {
				params: Joi.object({
					id: Joi.string().hex().length(64),
				}),
			},
		},
	});
};
