import { Container, Contracts, Utils } from "@arkecosystem/core-kernel";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions } from "@arkecosystem/crypto";
import { Interfaces as VotingInterfaces, Transactions as VotingTransactions } from "@protokol/voting-crypto";

import { VotingTransactionErrors } from "../errors";
import { VotingTransactionsEvents } from "../events";
import { createProposalVotingWalletIndex } from "../indexers";
import { ICreateProposalWallet } from "../interfaces";
import { VotingAbstractTransactionHandler } from "./abstract-handler";
import { CastVoteHandler } from "./cast-vote";

@Container.injectable()
export class CreateProposalHandler extends VotingAbstractTransactionHandler {
	@Container.inject(Container.Identifiers.TransactionPoolQuery)
	private readonly poolQuery!: Contracts.TransactionPool.Query;

	public getConstructor(): Transactions.TransactionConstructor {
		return VotingTransactions.CreateProposalTransaction;
	}

	public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
		return [CastVoteHandler];
	}

	public walletAttributes(): ReadonlyArray<string> {
		return ["voting.proposal"];
	}

	public emitEvents(transaction: Interfaces.ITransaction, emitter: Contracts.Kernel.EventDispatcher): void {
		void emitter.dispatch(VotingTransactionsEvents.createProposal, transaction.data);
	}

	public async throwIfCannotBeApplied(
		transaction: Interfaces.ITransaction,
		wallet: Contracts.State.Wallet,
	): Promise<void> {
		Utils.assert.defined<string>(transaction.data.senderPublicKey);
		Utils.assert.defined<VotingInterfaces.ICreateProposal>(transaction.data.asset?.votingCreateProposal);

		const proposedData: VotingInterfaces.ICreateProposal = transaction.data.asset.votingCreateProposal;

		const lastBlock: Interfaces.IBlock = this.app.get<any>(Container.Identifiers.StateStore).getLastBlock();
		if (lastBlock.data.height <= proposedData.duration.blockHeight) {
			throw new VotingTransactionErrors.CreateProposalHeightToLowError(
				lastBlock.data.height,
				proposedData.duration.blockHeight,
			);
		}
		return super.throwIfCannotBeApplied(transaction, wallet);
	}

	public async applyVotingTransaction(transaction: Interfaces.ITransactionData): Promise<void> {
		Utils.assert.defined<string>(transaction.id);
		Utils.assert.defined<string>(transaction.senderPublicKey);
		Utils.assert.defined<VotingInterfaces.ICreateProposal>(transaction.asset?.votingCreateProposal);

		const wallet = this.walletRepository.findByPublicKey(transaction.senderPublicKey);

		if (!wallet.hasAttribute("voting.proposal")) {
			wallet.setAttribute("voting.proposal", {});
		}

		const proposedWallet = wallet.getAttribute<ICreateProposalWallet>("voting.proposal");
		proposedWallet[transaction.id] = {
			proposal: transaction.asset.votingCreateProposal,
			agree: 0,
			disagree: 0,
			voters: {},
		};
		wallet.setAttribute<ICreateProposalWallet>("voting.proposal", proposedWallet);

		this.walletRepository.setOnIndex(createProposalVotingWalletIndex, transaction.id, wallet);
	}

	public async revertVotingTransaction(transaction: Interfaces.ITransactionData): Promise<void> {
		Utils.assert.defined<string>(transaction.senderPublicKey);
		Utils.assert.defined<string>(transaction.id);

		const wallet = this.walletRepository.findByPublicKey(transaction.senderPublicKey);

		const proposedWallet = wallet.getAttribute<ICreateProposalWallet>("voting.proposal");
		delete proposedWallet[transaction.id];
		wallet.setAttribute<ICreateProposalWallet>("voting.proposal", proposedWallet);

		this.walletRepository.forgetOnIndex(createProposalVotingWalletIndex, transaction.id);
	}
}
