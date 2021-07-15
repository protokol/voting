import { Identifiers, Server } from "@arkecosystem/core-api";
import { Container, Contracts, Providers } from "@arkecosystem/core-kernel";

import { defaults } from "./defaults";
import { Handler } from "./handler";

const plugin = require("../package.json");

export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		const logger: Contracts.Kernel.Logger = this.app.get(Container.Identifiers.LogService);
		logger.info(`Loading plugin: ${plugin.name} with version ${plugin.version}.`);

		for (const identifier of [Identifiers.HTTP, Identifiers.HTTPS]) {
			if (this.app.isBound<Server>(identifier)) {
				const server = this.app.get<Server>(identifier);
				await server.register({
					plugin: Handler,
					routes: { prefix: defaults.prefix },
				});
			}
		}
	}
}
