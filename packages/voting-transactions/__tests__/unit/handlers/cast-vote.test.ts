import "jest-extended";

import { Application, Container, Contracts } from "@arkecosystem/core-kernel";
import { Stores, Wallets } from "@arkecosystem/core-state";
import { passphrases } from "@arkecosystem/core-test-framework";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions } from "@arkecosystem/crypto";
import { Builders, Enums, Transactions as VotingTransactions } from "@protokol/voting-crypto";

import {
	Errors as VotingErrors,
	Events as VotingEvents,
	Handlers as VotingHandlers,
	Indexers as VotingIndexers,
} from "../../../src";
import { createProposalVotingWalletIndex } from "../../../src/indexers";
import { ICreateProposalWallet } from "../../../src/interfaces";
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
		let castVoteData;
		beforeEach(() => {
			castVoteData = new Builders.CastVoteBuilder()
				.castVote({
					proposalId: "0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5",
					decision: "yes",
				})
				.nonce("1")
				.sign(passphrases[0]!)
				.build();
		});

		it("Should Throw - CastVoteProposalDoesntExistsError", async () => {
			await expect(handler.throwIfCannotBeApplied(castVoteData, senderWallet)).rejects.toThrowError(
				VotingErrors.VotingTransactionErrors.CastVoteProposalDoesntExistsError,
			);
		});

		it("Should Throw - CastVoteAlreadyVotedError", async () => {
			const dummyWallet = buildWallet(app, passphrases[1]!);
			walletRepository.index(dummyWallet);
			walletRepository.setOnIndex(
				createProposalVotingWalletIndex,
				"0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5",
				dummyWallet,
			);
			const data = {};
			data["0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5"] = {
				agree: [senderWallet.getPublicKey()!],
				disagree: [],
				proposal: { duration: { blockHeight: 1234 } },
			};
			dummyWallet.setAttribute("voting.proposal", data);

			await expect(handler.throwIfCannotBeApplied(castVoteData, senderWallet)).rejects.toThrowError(
				VotingErrors.VotingTransactionErrors.CastVoteAlreadyVotedError,
			);
		});

		it("Should not Throw", async () => {
			const dummyContentWallet = buildWallet(app, passphrases[1]!);
			walletRepository.setOnIndex(
				createProposalVotingWalletIndex,
				"0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5",
				dummyContentWallet,
			);
			const dummyContentData = {};
			dummyContentData["0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5"] = {
				proposal: {
					duration: {
						blockHeight: 123,
					},
					content: "stringqwer123",
				},
				agree: [],
				disagree: [],
			};
			dummyContentWallet.setAttribute("voting.proposal", dummyContentData);

			const mockLastBlockData: Partial<Interfaces.IBlockData> = { height: 12 };
			const mockGetLastBlock = jest.fn();
			Stores.StateStore.prototype.getLastBlock = mockGetLastBlock;
			mockGetLastBlock.mockReturnValue({ data: mockLastBlockData });

			await expect(handler.throwIfCannotBeApplied(castVoteData, senderWallet)).toResolve();
		});
	});

	describe("Apply and Revert", () => {
		beforeEach(() => {
			actual = new Builders.CastVoteBuilder()
				.castVote({
					proposalId: "0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5",
					decision: "yes",
				})
				.nonce("1")
				.sign(passphrases[0]!)
				.build();

			const dummyWallet = buildWallet(app, passphrases[1]!);
			walletRepository.setOnIndex(
				createProposalVotingWalletIndex,
				"0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5",
				dummyWallet,
			);
			const dummy = dummyWallet.getAttribute("voting.proposal", {});
			dummy["0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5"] = {
				proposal: {
					duration: {
						blockHeight: 123,
					},
					content: "stringqwer123",
				},
				agree: [],
				disagree: [],
			};
			dummyWallet.setAttribute<ICreateProposalWallet>("voting.proposal", dummy);
		});
		describe("applyVotingTransaction", () => {
			it("Should Resolve - Single Transaction", async () => {
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
});
