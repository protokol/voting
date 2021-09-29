import Boom from "@hapi/boom";

export const TransactionDoesntExists = Boom.notFound("Transaction not found!");

export const WalletDoesntExists = Boom.notFound("Wallet not found!");

export const ProposalDoesntExists = Boom.notFound("Voting Proposal not found!");

// Transformer Errors
export class RawTypeNotSupportedError extends Error {
	constructor() {
		super("Raw Type Transformation is not Supported");
	}
}
