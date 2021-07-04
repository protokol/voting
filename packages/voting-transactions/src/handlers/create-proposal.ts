import { Container, Contracts, Utils } from "@arkecosystem/core-kernel";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions } from "@arkecosystem/crypto";
import { Transactions as VotingTransactions } from "@protokol/voting-crypto";

import { VotingPoolErrors } from "../errors";
import { VotingTransactionsEvents } from "../events";
import { createProposalVotingWalletIndex } from "../indexers";
import { ICreateProposalWallet } from "../interfaces";
import { VotingAbstractTransactionHandler } from "./abstract-handler";

@Container.injectable()
export class CreateProposalHandler extends VotingAbstractTransactionHandler {
	@Container.inject(Container.Identifiers.TransactionPoolQuery)
	private readonly poolQuery!: Contracts.TransactionPool.Query;

	public getConstructor(): Transactions.TransactionConstructor {
		return VotingTransactions.CreateProposalTransaction;
	}

	public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
		return [];
	}

	public walletAttributes(): ReadonlyArray<string> {
		return [];
	}

	public emitEvents(transaction: Interfaces.ITransaction, emitter: Contracts.Kernel.EventDispatcher): void {
		void emitter.dispatch(VotingTransactionsEvents.createProposal, transaction.data);
	}

	// public async throwIfCannotEnterPool(transaction: Interfaces.ITransaction): Promise<void> {
	// 	Utils.assert.defined<string>(transaction.data.senderPublicKey);
	//
	// 	const isInPool = this.poolQuery.getAllBySender(transaction.data.senderPublicKey).whereKind(transaction).has();
	//
	// 	if (isInPool) {
	// 		throw new VotingPoolErrors.VotingTransactionAlreadyInPoolPoolError();
	// 	}
	// }

	public async applyVotingTransaction(transaction: Interfaces.ITransactionData): Promise<void> {
		Utils.assert.defined<string>(transaction.id);
		Utils.assert.defined<string>(transaction.senderPublicKey);
		Utils.assert.defined<string>(transaction.asset?.votingCreateProposal);

		const wallet = this.walletRepository.findByPublicKey(transaction.senderPublicKey);

		const proposedWallet = wallet.getAttribute<ICreateProposalWallet>("voting.proposal");
		proposedWallet[transaction.id] = {
			proposal: transaction.asset?.votingCreateProposal,
			agree: 0,
			disagree: 0,
		};
		wallet.setAttribute<ICreateProposalWallet>("voting.proposal", proposedWallet);

		this.walletRepository.setOnIndex(createProposalVotingWalletIndex, transaction.senderPublicKey, wallet);
	}

	public async revertVotingTransaction(transaction: Interfaces.ITransactionData): Promise<void> {
		Utils.assert.defined<string>(transaction.senderPublicKey);
		Utils.assert.defined<string>(transaction.id);

		const wallet = this.walletRepository.findByPublicKey(transaction.senderPublicKey);

		const proposedWallet = wallet.getAttribute<ICreateProposalWallet>("voting.proposal");
		delete proposedWallet[transaction.id];
		wallet.setAttribute<ICreateProposalWallet>("voting.proposal", proposedWallet);

		this.walletRepository.forgetOnIndex(createProposalVotingWalletIndex, transaction.senderPublicKey);
	}
}
