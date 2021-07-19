import { Controller } from "@arkecosystem/core-api";
import Hapi from "@hapi/hapi";

export const register = (server: Hapi.Server, registrationController: typeof Controller): void => {
	// const controller: RegistrationController = server.app.app.resolve(registrationController);

	// server.bind(controller);

	server.route({
		method: "GET",
		path: "/statistic/${id}",
		handler: (request: Hapi.Request) => () => {},
		options: {},
	});
};
