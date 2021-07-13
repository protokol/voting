import { Errors } from "@arkecosystem/core-transactions";

// Fee errors
export class StaticFeeMismatchError extends Errors.TransactionError {
	public constructor(staticFee: string) {
		super(`Failed to apply transaction, because fee doesn't match static fee ${staticFee}.`);
	}
}
// Create Proposal
export class CreateProposalHeightToLowError extends Errors.TransactionError {
	public constructor(blockHeight: number, transactionHeight: number) {
		super(
			`Failed to apply transaction, because block height [${blockHeight}] is lower then transaction height [${transactionHeight}].`,
		);
	}
}

// Cast Vote
export class CastVoteProposalDoesntExistsError extends Errors.TransactionError {
	public constructor() {
		super(`Failed to apply transaction, because proposal transaction doesn't exists.`);
	}
}

export class CastVoteAlreadyVotedError extends Errors.TransactionError {
	public constructor() {
		super(`Failed to apply transaction, because wallet already voted.`);
	}
}
