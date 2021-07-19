import { Container, Contracts, Providers } from "@arkecosystem/core-kernel";

import { CastVoteHandler, CreateProposalHandler } from "./handlers";
import { castVoteVotingWalletIndex, createProposalVotingWalletIndex } from "./indexers";

const plugin = require("../package.json");

export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		const logger: Contracts.Kernel.Logger = this.app.get(Container.Identifiers.LogService);
		logger.info(`Loading plugin: ${plugin.name} with version ${plugin.version}.`);

		this.app
			.bind<Contracts.State.WalletIndexerIndex>(Container.Identifiers.WalletRepositoryIndexerIndex)
			.toConstantValue({
				name: createProposalVotingWalletIndex,
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				indexer: () => {},
				autoIndex: false,
			});

		this.app
			.bind<Contracts.State.WalletIndexerIndex>(Container.Identifiers.WalletRepositoryIndexerIndex)
			.toConstantValue({
				name: castVoteVotingWalletIndex,
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				indexer: () => {},
				autoIndex: false,
			});

		this.app.bind(Container.Identifiers.TransactionHandler).to(CreateProposalHandler);
		this.app.bind(Container.Identifiers.TransactionHandler).to(CastVoteHandler);
	}
}
