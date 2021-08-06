import { Contracts } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
import { Indexers } from "@protokol/voting-transactions";
import { getRepository } from "typeorm";

import { BlockBalance } from "./entities";

type handleType = (payload: { name: Contracts.Kernel.EventName; data: Interfaces.IBlockData }) => Promise<any>;

class Event implements Contracts.Kernel.EventListener {
	constructor(public handle: handleType) {}
}

export class EventFactory {
	private blockBalancesRepository = getRepository(BlockBalance);

	public blockAppliedEvent(walletRepository: Contracts.State.WalletRepository): Event {
		return new Event(async ({ data }) => {
			const filteredProposals = walletRepository
				.getIndex(Indexers.createProposalVotingWalletIndex)
				.entries()
				.reduce((proposals, [id, wallet]) => {
					const proposal = wallet.getAttribute("voting.proposal")[id];
					if (proposal.proposal.duration.blockHeight === data.height) {
						const blockBalance = new BlockBalance(
							id,
							data.id!,
							proposal.agree.map((publicKey) => ({
								publicKey,
								balance: walletRepository.findByPublicKey(publicKey).getBalance(),
							})),
							proposal.disagree.map((publicKey) => ({
								publicKey,
								balance: walletRepository.findByPublicKey(publicKey).getBalance(),
							})),
						);
						proposals.push(blockBalance);
					}
					return proposals;
				}, [] as BlockBalance[]);
			if (filteredProposals.length) {
				await this.blockBalancesRepository.insert(filteredProposals);
			}
		});
	}

	public blockRevertEvent(): Event {
		return new Event(async ({ data }) => await this.blockBalancesRepository.delete({ blockId: data.id }));
	}
}
