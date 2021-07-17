import { Controller, Schemas } from "@arkecosystem/core-api";
import Hapi from "@hapi/hapi";
import Joi from "joi";

import { CreateProposalController } from "../controllers";

export const register = (server: Hapi.Server, createProposalController: typeof Controller): void => {
	const controller: CreateProposalController = server.app.app.resolve(createProposalController);

	server.bind(controller);

	server.route({
		method: "GET",
		path: "/create/proposal/transactions",
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
		path: "/create/proposal/transactions/${id}",
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
		path: "/create/proposal/${id}/wallet",
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
