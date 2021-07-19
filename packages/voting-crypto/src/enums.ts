import { defaults } from "./defaults";

export enum VotingTransactionTypes {
	CreateProposal = 0,
	CastVote = 1,
}

export const VotingTransactionGroup = defaults.votingTypeGroup;

// parse to string
const createProposalStaticFee: any = defaults.votingStaticFees.createProposal.toString();
const castVoteStaticFee: any = defaults.votingStaticFees.createProposal.toString();

export enum VotingStaticFees {
	CreateProposal = createProposalStaticFee,
	CastVote = castVoteStaticFee,
}

export const VotingTransactionVersion = defaults.version;

export enum VotingOptions {
	Agree = "yes",
	Disagree = "no",
}
