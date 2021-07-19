import { Controller } from "@arkecosystem/core-api";
import { Container, Contracts } from "@arkecosystem/core-kernel";
import Hapi from "@hapi/hapi";
import { Indexers } from "@protokol/voting-transactions";

import { StatisticsResource } from "../resources/statistics";

@Container.injectable()
export class StatisticsController extends Controller {
	@Container.inject(Container.Identifiers.WalletRepository)
	@Container.tagged("state", "blockchain")
	private readonly walletRepository!: Contracts.State.WalletRepository;

	public async statistics(request: Hapi.Request): Promise<any> {
		const proposedWallet = this.walletRepository.findByIndex(
			Indexers.createProposalVotingWalletIndex,
			request.params.id,
		);

		const proposedWalletData = proposedWallet.getAttribute("voting.proposal");
		const proposedData = proposedWalletData[request.params.id];

		return this.respondWithResource(
			{
				publicKey: proposedWallet.getPublicKey(),
				address: proposedWallet.getAddress(),
				voters: proposedData,
			},
			StatisticsResource,
		);
	}
}
