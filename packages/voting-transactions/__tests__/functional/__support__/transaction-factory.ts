import { Contracts } from "@arkecosystem/core-kernel";
import { TransactionFactory } from "@arkecosystem/core-test-framework";
import { Builders, Interfaces } from "@protokol/voting-crypto";

export class VotingTransactionFactory extends TransactionFactory {
	protected constructor(app?: Contracts.Kernel.Application) {
		super(app);
	}

	public static override initialize(app?: Contracts.Kernel.Application): VotingTransactionFactory {
		return new VotingTransactionFactory(app);
	}

	public CreateProposal(createProposal: Interfaces.ICreateProposal): VotingTransactionFactory {
		this.builder = new Builders.CreateProposalBuilder().createProposal(createProposal);

		return this;
	}

	public CastVote(castVote: Interfaces.ICastVote): VotingTransactionFactory {
		this.builder = new Builders.CastVoteBuilder().castVote(castVote);

		return this;
	}
}
