import { Contracts } from "@arkecosystem/core-api";
import { Container } from "@arkecosystem/core-kernel";

@Container.injectable()
export class VotingTransactionResource implements Contracts.Resource {
	public raw(resource): object {
		return JSON.parse(JSON.stringify(resource));
	}

	public transform(resource): object {
		return {
			id: resource.id,
			senderPublicKey: resource.senderPublicKey,
			...(resource.asset.votingCreateProposal || resource.asset.votingCastVote),
		};
	}
}
