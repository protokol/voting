import { Container, Contracts, Providers } from "@arkecosystem/core-kernel";

import { CreateProposalHandler } from "./handlers";
import { createProposalVotingWalletIndex } from "./indexers";

const plugin = require("../package.json");

export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		const logger: Contracts.Kernel.Logger = this.app.get(Container.Identifiers.LogService);
		logger.info(`Loading plugin: ${plugin.name} with version ${plugin.version}.`);

		this.app
			.bind<Contracts.State.WalletIndexerIndex>(Container.Identifiers.WalletRepositoryIndexerIndex)
			.toConstantValue({
				name: createProposalVotingWalletIndex,
				indexer: () => undefined,
				autoIndex: false,
			});

		this.app.bind(Container.Identifiers.TransactionHandler).to(CreateProposalHandler);
	}
}
