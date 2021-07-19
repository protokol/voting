import { Container } from "@arkecosystem/core-kernel";
import Hapi from "@hapi/hapi";
import { Enums } from "@protokol/voting-crypto";
import { Indexers } from "@protokol/voting-transactions";

import { BaseController } from "./base-controller";

@Container.injectable()
export class CastVoteController extends BaseController {
	public async transactions(request: Hapi.Request): Promise<any> {
		return this.votingTransactions(request, Enums.VotingTransactionTypes.CastVote);
	}

	public async transaction(request: Hapi.Request): Promise<any> {
		return this.singleTransaction(request, Enums.VotingTransactionTypes.CastVote);
	}

	public async wallet(request: Hapi.Request): Promise<any> {
		return this.showByWalletId(request, Indexers.castVoteVotingWalletIndex);
	}
}
