import { VotingTransactionTypes } from "../enums";
import { ICreateProposal } from "../interfaces";
import { CreateProposalTransaction } from "../transactions";
import { AbstractVotingBuilder } from "./abstract-builder";

export class CreateProposalBuilder extends AbstractVotingBuilder<CreateProposalBuilder> {
	public constructor() {
		super();
		this.data.type = VotingTransactionTypes.CreateProposal;
		this.data.fee = CreateProposalTransaction.staticFee();
		this.data.asset = { votingCreateProposal: {} };
	}

	public createProposal(votingCreateProposal: ICreateProposal): CreateProposalBuilder {
		if (this.data.asset && this.data.asset.votingCreateProposal) {
			this.data.asset.votingCreateProposal = {
				...votingCreateProposal,
			};
		}
		return this;
	}

	protected instance(): CreateProposalBuilder {
		return this;
	}
}
