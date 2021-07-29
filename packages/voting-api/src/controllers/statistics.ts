import { Controller } from "@arkecosystem/core-api";
import { Container, Contracts } from "@arkecosystem/core-kernel";
import { Utils } from "@arkecosystem/crypto";
import Hapi from "@hapi/hapi";
import { Indexers } from "@protokol/voting-transactions";

import { VotingStatusEnum } from "../enums";
import { StatisticsResource } from "../resources/statistics";

@Container.injectable()
export class StatisticsController extends Controller {
	@Container.inject(Container.Identifiers.WalletRepository)
	@Container.tagged("state", "blockchain")
	private readonly walletRepository!: Contracts.State.WalletRepository;

	@Container.inject(Container.Identifiers.StateStore)
	protected readonly stateStore!: Contracts.State.StateStore;

	public async statistics(request: Hapi.Request): Promise<any> {
		const proposedWallet = this.walletRepository.findByIndex(
			Indexers.createProposalVotingWalletIndex,
			request.params.id,
		);

		const proposedWalletData = proposedWallet.getAttribute("voting.proposal");
		const proposedData = proposedWalletData[request.params.id];
		const { blockHeight } = proposedData.proposal.duration;

		let agree: { publicKey: string; balance: Utils.BigNumber }[];
		let disagree: { publicKey: string; balance: Utils.BigNumber }[];
		let status: VotingStatusEnum;
		if (blockHeight > this.stateStore.getLastBlock().data.height) {
			agree = proposedData.agree.map((publicKey) => ({
				publicKey,
				balance: this.walletRepository.findByPublicKey(publicKey).getBalance(),
			}));
			disagree = proposedData.disagree.map((publicKey) => ({
				publicKey,
				balance: this.walletRepository.findByPublicKey(publicKey).getBalance(),
			}));
			status = VotingStatusEnum.IN_PROGRESS;
		} else {
			// TODO fetch from database
			agree = proposedData.agree.map((publicKey) => ({ publicKey, balance: Utils.BigNumber.ONE }));
			disagree = proposedData.disagree.map((publicKey) => ({ publicKey, balance: Utils.BigNumber.ONE }));
			status = VotingStatusEnum.FINISHED;
		}

		return this.respondWithResource(
			{
				publicKey: proposedWallet.getPublicKey(),
				address: proposedWallet.getAddress(),
				voters: { agree, disagree },
				status,
			},
			StatisticsResource,
		);
	}
}
