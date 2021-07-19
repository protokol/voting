import { Interfaces } from "@protokol/voting-crypto";

export interface ICreateProposalWallet extends Record<string, any> {
	proposal: Interfaces.ICreateProposal;
	agree: number;
	disagree: number;
	voters: [];
}
