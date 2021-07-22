import { Interfaces } from "@protokol/voting-crypto";

interface CreateProposal {
	proposal: Interfaces.ICreateProposal;
	agree: string[];
	disagree: string[];
}

export interface ICreateProposalWallet extends Record<string, CreateProposal> {}
