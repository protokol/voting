import { Utils } from "@arkecosystem/crypto";

export interface ICreateProposal {
	duration: {
		blockHeight: Utils.BigNumber;
	};
	content: string;
}

export interface ICastVote {
	proposalId: string;
	decision: string;
}
