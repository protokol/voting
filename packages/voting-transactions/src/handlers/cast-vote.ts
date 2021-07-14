import { Container, Contracts, Utils } from "@arkecosystem/core-kernel";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions } from "@arkecosystem/crypto";
import { Enums, Interfaces as VotingInterfaces, Transactions as VotingTransactions } from "@protokol/voting-crypto";

import { VotingPoolErrors, VotingTransactionErrors } from "../errors";
import { VotingTransactionsEvents } from "../events";
import { castVoteVotingWalletIndex, createProposalVotingWalletIndex } from "../indexers";
import { ICreateProposalWallet } from "../interfaces";
import { VotingAbstractTransactionHandler } from "./abstract-handler";

@Container.injectable()
export class CastVoteHandler extends VotingAbstractTransactionHandler {
	@Container.inject(Container.Identifiers.TransactionPoolQuery)
	private readonly poolQuery!: Contracts.TransactionPool.Query;

	public getConstructor(): Transactions.TransactionConstructor {
		return VotingTransactions.CastVoteTransaction;
	}

	public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
		return [];
	}

	public walletAttributes(): ReadonlyArray<string> {
		return [];
	}

	public emitEvents(transaction: Interfaces.ITransaction, emitter: Contracts.Kernel.EventDispatcher): void {
		void emitter.dispatch(VotingTransactionsEvents.castVote, transaction.data);
	}

	public async throwIfCannotEnterPool(transaction: Interfaces.ITransaction): Promise<void> {
		Utils.assert.defined<string>(transaction.data.senderPublicKey);

		const isInPool = this.poolQuery.getAllBySender(transaction.data.senderPublicKey).whereKind(transaction).has();

		if (isInPool) {
			throw new VotingPoolErrors.VotingTransactionAlreadyInPoolPoolError();
		}
	}

	public async throwIfCannotBeApplied(
		transaction: Interfaces.ITransaction,
		wallet: Contracts.State.Wallet,
	): Promise<void> {
		console.log("throwIfCannotBeApplied");
		Utils.assert.defined<string>(transaction.data.senderPublicKey);
		Utils.assert.defined<VotingInterfaces.ICastVote>(transaction.data.asset?.votingCastVote);

		const castVote = transaction.data.asset.votingCastVote;
		console.log(castVote);
		if (!this.walletRepository.hasByIndex(createProposalVotingWalletIndex, castVote.proposalId)) {
			throw new VotingTransactionErrors.CastVoteProposalDoesntExistsError();
		}

		const proposedWallet = this.walletRepository.findByIndex(createProposalVotingWalletIndex, castVote.proposalId);
		console.log(proposedWallet);

		const proposedWalletData = proposedWallet.getAttribute<ICreateProposalWallet>("voting.proposal");
		console.log(proposedWalletData.voters[transaction.data.senderPublicKey])
		if (proposedWalletData.voters[transaction.data.senderPublicKey]) {
			console.log(proposedWalletData.voters)

			throw new VotingTransactionErrors.CastVoteAlreadyVotedError();
		}
		console.log(proposedWalletData.proposal.duration.blockHeight);
		const lastBlock: Interfaces.IBlock = this.app.get<any>(Container.Identifiers.StateStore).getLastBlock();
		console.log(lastBlock.data.height);

		if (proposedWalletData.proposal.duration.blockHeight <= lastBlock.data.height) {
			throw new VotingTransactionErrors.CastVotelHeightToHighError(
				lastBlock.data.height,
				proposedWalletData.proposal.duration.blockHeight,
			);
		}

		return super.throwIfCannotBeApplied(transaction, wallet);
	}

	public async applyVotingTransaction(transaction: Interfaces.ITransactionData): Promise<void> {
		console.log(transaction);
		Utils.assert.defined<VotingInterfaces.ICastVote>(transaction.asset?.votingCastVote);
		Utils.assert.defined<string>(transaction.id);
		Utils.assert.defined<string>(transaction.senderPublicKey);

		const castVote = transaction.asset.votingCastVote;

		const proposedWallet = this.walletRepository.findByIndex(createProposalVotingWalletIndex, castVote.proposalId);

		const proposedWalletData = proposedWallet.getAttribute<ICreateProposalWallet>("voting.proposal");
		if (castVote.decision === Enums.VotingOptions.Agree) {
			proposedWalletData.agree++;
		} else {
			proposedWalletData.disagree++;
		}
		proposedWalletData.voters[castVote.proposalId] = {};
		proposedWallet.setAttribute<ICreateProposalWallet>("voting.proposal", proposedWalletData);

		const castedWallet = this.walletRepository.findByPublicKey(transaction.senderPublicKey);

		this.walletRepository.setOnIndex(castVoteVotingWalletIndex, transaction.id, castedWallet);
	}

	public async revertVotingTransaction(transaction: Interfaces.ITransactionData): Promise<void> {
		Utils.assert.defined<string>(transaction.senderPublicKey);
		Utils.assert.defined<string>(transaction.id);
		Utils.assert.defined<VotingInterfaces.ICastVote>(transaction.asset?.votingCastVote);

		const castVote = transaction.asset.votingCastVote;

		const proposedWallet = this.walletRepository.findByIndex(createProposalVotingWalletIndex, castVote.proposalId);
		const proposedWalletData = proposedWallet.getAttribute<ICreateProposalWallet>("voting.proposal");
		if (castVote.decision === Enums.VotingOptions.Agree) {
			proposedWalletData.agree--;
		} else {
			proposedWalletData.disagree--;
		}
		delete proposedWalletData.voters[castVote.proposalId];
		proposedWallet.setAttribute<ICreateProposalWallet>("voting.proposal", proposedWalletData);

		this.walletRepository.forgetOnIndex(castVoteVotingWalletIndex, transaction.id);
	}
}
