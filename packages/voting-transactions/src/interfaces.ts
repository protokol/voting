import { Interfaces } from "@protokol/voting-crypto";

export interface ICreateProposalWallet {
	proposal: Interfaces.ICreateProposal;
	agree: number;
	disagree: number;
}
