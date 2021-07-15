import Boom from "@hapi/boom";

export const TransactionDoesntExists = Boom.notFound("Transaction not found!");

export const WalletDoesntExists = Boom.notFound("Wallet not found!");
