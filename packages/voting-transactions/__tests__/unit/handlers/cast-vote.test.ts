import "jest-extended";

import { Application, Container, Contracts } from "@arkecosystem/core-kernel";
import { Wallets } from "@arkecosystem/core-state";
import { passphrases } from "@arkecosystem/core-test-framework";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";
import { Builders, Enums, Transactions as VotingTransactions } from "@protokol/voting-crypto";

import { createProposalVotingWalletIndex } from "../../../dist/indexers";
import {
	Enums as VotingEnums,
	Errors as VotingErrors,
	Events as VotingEvents,
	Handlers as VotingHandlers,
	Indexers as VotingIndexers,
} from "../../../src";
import { buildWallet, initApp } from "../__support__/app";

let app: Application;

let senderWallet: Contracts.State.Wallet;

let transactionHandlerRegistry: Handlers.Registry;

let handler: VotingHandlers.VotingAbstractTransactionHandler;

let actual: Interfaces.ITransaction;

let walletRepository: Wallets.WalletRepository;

const transactionHistoryService = {
	streamByCriteria: jest.fn(),
};

beforeEach(async () => {
	app = initApp();

	app.bind<Contracts.State.WalletIndexerIndex>(Container.Identifiers.WalletRepositoryIndexerIndex).toConstantValue({
		name: VotingIndexers.createProposalVotingWalletIndex,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		indexer: () => {},
		autoIndex: false,
	});

	app.bind<Contracts.State.WalletIndexerIndex>(Container.Identifiers.WalletRepositoryIndexerIndex).toConstantValue({
		name: VotingIndexers.castVoteVotingWalletIndex,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		indexer: () => {},
		autoIndex: false,
	});

	walletRepository = app.get<Wallets.WalletRepository>(Container.Identifiers.WalletRepository);

	app.bind(Container.Identifiers.TransactionHistoryService).toConstantValue(transactionHistoryService);

	senderWallet = buildWallet(app, passphrases[0]!);

	walletRepository.index(senderWallet);

	app.bind(Container.Identifiers.TransactionHandler).to(VotingHandlers.CreateProposalHandler);
	app.bind(Container.Identifiers.TransactionHandler).to(VotingHandlers.CastVoteHandler);

	transactionHandlerRegistry = app.get<Handlers.Registry>(Container.Identifiers.TransactionHandlerRegistry);

	handler = transactionHandlerRegistry.getRegisteredHandlerByType(
		Transactions.InternalTransactionType.from(Enums.VotingTransactionTypes.CastVote, Enums.VotingTransactionGroup),
		2,
	) as VotingHandlers.VotingAbstractTransactionHandler;
});

afterEach(() => {
	Transactions.TransactionRegistry.deregisterTransactionType(VotingTransactions.CreateProposalTransaction);
	Transactions.TransactionRegistry.deregisterTransactionType(VotingTransactions.CastVoteTransaction);
});

describe("CastVote", () => {
	describe("getConstructor", () => {
		it("Should get Right Instance Type", () => {
			expect(typeof handler.getConstructor()).toBe(typeof Transactions.Transaction);
		});
	});

	describe("dependencies", () => {
		it("Should get Empty Array", () => {
			expect(handler.dependencies()).toBeArray();
			expect(handler.dependencies()).toBeEmpty();
		});
	});

	describe("walletAttributes", () => {
		it("Should get Empty Array", () => {
			expect(handler.walletAttributes()).toBeArray();
			expect(handler.walletAttributes()).toBeEmpty();
		});
	});

	describe("emitEvents", () => {
		it("Should Test Event Emit", () => {
			const emitter: Contracts.Kernel.EventDispatcher = app.get<Contracts.Kernel.EventDispatcher>(
				Container.Identifiers.EventDispatcherService,
			);

			const spy = jest.spyOn(emitter, "dispatch");

			const data = new Builders.CastVoteBuilder()
				.castVote({
					proposalId: "0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5",
					decision: "yes",
				})
				.nonce("1")
				.sign(passphrases[0]!)
				.build();

			handler.emitEvents(data, emitter);

			expect(spy).toHaveBeenCalledWith(VotingEvents.VotingTransactionsEvents.castVote, expect.anything());
		});
	});

	describe("throwIfCannotBeApplied", () => {
		const castVoteData = new Builders.CastVoteBuilder()
			.castVote({
				proposalId: "0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5",
				decision: "yes",
			})
			.nonce("1")
			.sign(passphrases[0]!)
			.build();

		it("Should Throw - CastVoteProposalDoesntExistsError", async () => {
			await expect(handler.throwIfCannotBeApplied(castVoteData, senderWallet)).rejects.toThrowError(
				VotingErrors.VotingTransactionErrors.CastVoteProposalDoesntExistsError,
			);
		});

		it("Should Throw - CastVoteAlreadyVotedError", async () => {
			const dummyWallet = buildWallet(app, passphrases[1]!);
			walletRepository.setOnIndex(
				createProposalVotingWalletIndex,
				"0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5",
				dummyWallet,
			);
			await expect(handler.throwIfCannotBeApplied(castVoteData, senderWallet)).rejects.toThrowError(
				VotingErrors.VotingTransactionErrors.CastVoteAlreadyVotedError,
			);
		});

		it("Should not Throw", async () => {
			// senderWallet.setAttribute()
			await expect(handler.throwIfCannotBeApplied(castVoteData, senderWallet)).toResolve();
		});
	});

	describe("applyVotingTransaction", () => {
		it("Should Resolve - Single Transaction", async () => {
			await expect(handler.applyVotingTransaction(actual.data)).toResolve();
		});

		it("Should Resolve - Two Transactions", async () => {
			await expect(handler.applyVotingTransaction(actual.data)).toResolve();

			actual = new Builders.CreateProposalBuilder()
				.createProposal({
					duration: {
						blockHeight: Utils.BigNumber.make(1234),
					},
					content: "qw12312",
				})
				.nonce("2")
				.sign(passphrases[0]!)
				.build();

			await expect(handler.applyVotingTransaction(actual.data)).toResolve();
		});
	});

	describe("revertVotingTransaction", () => {
		it("Should Resolve", async () => {
			await handler.applyVotingTransaction(actual.data);

			await expect(handler.revertVotingTransaction(actual.data)).toResolve();
		});
	});
});
