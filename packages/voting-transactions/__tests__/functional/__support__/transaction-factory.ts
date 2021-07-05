import { Contracts } from "@arkecosystem/core-kernel";
import { TransactionFactory } from "@arkecosystem/core-test-framework";
import { Builders } from "@protokol/voting-crypto";

export class VotingTransactionFactory extends TransactionFactory {
	protected constructor(app?: Contracts.Kernel.Application) {
		super(app);
	}

	public static initialize(app?: Contracts.Kernel.Application): VotingTransactionFactory {
		return new VotingTransactionFactory(app);
	}

	public CreateProposal(): VotingTransactionFactory {
		this.builder = new Builders.CreateProposalBuilder();

		return this;
	}

	public CastVote(): VotingTransactionFactory {
		this.builder = new Builders.CastVoteBuilder();

		return this;
	}
}
