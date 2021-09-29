import { Controller } from "@arkecosystem/core-api";
import { Container, Contracts } from "@arkecosystem/core-kernel";
import Hapi from "@hapi/hapi";
import { Indexers } from "@protokol/voting-transactions";
import { getRepository } from "typeorm";

import { BlockBalance } from "../entities";
import { VotingStatusEnum } from "../enums";
import { ApiErrors } from "../errors";
import { WalletBalance } from "../interfaces";
import { StatisticsResource } from "../resources/statistics";

@Container.injectable()
export class StatisticsController extends Controller {
	@Container.inject(Container.Identifiers.WalletRepository)
	@Container.tagged("state", "blockchain")
	private readonly walletRepository!: Contracts.State.WalletRepository;

	@Container.inject(Container.Identifiers.StateStore)
	protected readonly stateStore!: Contracts.State.StateStore;

	public async statistics(request: Hapi.Request): Promise<any> {
		const { id } = request.params;
		let proposedWallet: Contracts.State.Wallet | undefined;

		try {
			proposedWallet = this.walletRepository.findByIndex(Indexers.createProposalVotingWalletIndex, id);
		} catch {
			return ApiErrors.ProposalDoesntExists;
		}

		const proposedWalletData = proposedWallet.getAttribute("voting.proposal");
		const proposedData = proposedWalletData[id];
		const { blockHeight } = proposedData.proposal.duration;

		let agree: WalletBalance[];
		let disagree: WalletBalance[];
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
			const blockBalance = await getRepository(BlockBalance).findOneOrFail({ id });
			agree = blockBalance.agree;
			disagree = blockBalance.disagree;
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
