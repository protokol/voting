import { Contracts } from "@arkecosystem/core-kernel";

export class VotingTransactionAlreadyInPoolPoolError extends Contracts.TransactionPool.PoolError {
	public constructor() {
		super(`Voting, this type of transaction was already sent from this public key`, "ERR_PENDING");
	}
}
