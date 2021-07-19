import { ICastVote } from "../interfaces";
import { CastVoteTransaction } from "../transactions";
import { AbstractVotingBuilder } from "./abstract-builder";

export class CastVoteBuilder extends AbstractVotingBuilder<CastVoteBuilder> {
	public constructor() {
		super();
		this.data.type = CastVoteTransaction.type;
		this.data.fee = CastVoteTransaction.staticFee();
		this.data.asset = { votingCastVote: {} };
	}

	public castVote(votingCastVote: ICastVote): CastVoteBuilder {
		if (this.data.asset && this.data.asset.votingCastVote) {
			this.data.asset.votingCastVote = {
				...votingCastVote,
			};
		}
		return this;
	}

	protected instance(): CastVoteBuilder {
		return this;
	}
}
