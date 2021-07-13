import "jest-extended";

import { Application, Container, Contracts } from "@arkecosystem/core-kernel";
import { Wallets } from "@arkecosystem/core-state";
import { passphrases } from "@arkecosystem/core-test-framework";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";
import { Builders, Enums, Transactions as VotingTransactions } from "@protokol/voting-crypto";

import { VotingTransactionsEvents } from "../../../src/events";
import { CreateProposalHandler } from "../../../src/handlers";
import { VotingAbstractTransactionHandler } from "../../../src/handlers";
import { createProposalVotingWalletIndex } from "../../../src/indexers";
import { buildWallet, initApp } from "../__support__/app";

let app: Application;

let senderWallet: Contracts.State.Wallet;

let transactionHandlerRegistry: Handlers.Registry;

let handler: VotingAbstractTransactionHandler;

let actual: Interfaces.ITransaction;

let walletRepository: Wallets.WalletRepository;

const transactionHistoryService = {
	streamByCriteria: jest.fn(),
};

beforeEach(async () => {
	app = initApp();

	app.bind<Contracts.State.WalletIndexerIndex>(Container.Identifiers.WalletRepositoryIndexerIndex).toConstantValue({
		name: createProposalVotingWalletIndex,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		indexer: () => {},
		autoIndex: false,
	});

	walletRepository = app.get<Wallets.WalletRepository>(Container.Identifiers.WalletRepository);

	app.bind(Container.Identifiers.TransactionHistoryService).toConstantValue(transactionHistoryService);

	senderWallet = buildWallet(app, passphrases[0]!);

	walletRepository.index(senderWallet);

	app.bind(Container.Identifiers.TransactionHandler).to(CreateProposalHandler);

	transactionHandlerRegistry = app.get<Handlers.Registry>(Container.Identifiers.TransactionHandlerRegistry);

	handler = transactionHandlerRegistry.getRegisteredHandlerByType(
		Transactions.InternalTransactionType.from(
			Enums.VotingTransactionTypes.CreateProposal,
			Enums.VotingTransactionGroup,
		),
		2,
	) as VotingAbstractTransactionHandler;

	actual = new Builders.CreateProposalBuilder()
		.createProposal({
			duration: {
				blockHeight: 1234,
			},
			content: "qw12312",
		})
		.nonce("1")
		.sign(passphrases[0]!)
		.build();
});

afterEach(() => {
	Transactions.TransactionRegistry.deregisterTransactionType(VotingTransactions.CreateProposalTransaction);
});

describe("CreateProposal", () => {
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
		it("Should Not get Empty Array", () => {
			expect(handler.walletAttributes()).toBeArray();
			expect(handler.walletAttributes()).not.toBeEmpty();
		});
	});

	describe("emitEvents", () => {
		it("Should Test Event Emit", () => {
			const emitter: Contracts.Kernel.EventDispatcher = app.get<Contracts.Kernel.EventDispatcher>(
				Container.Identifiers.EventDispatcherService,
			);

			const spy = jest.spyOn(emitter, "dispatch");

			handler.emitEvents(actual, emitter);

			expect(spy).toHaveBeenCalledWith(VotingTransactionsEvents.createProposal, expect.anything());
		});
	});

	describe("throwIfCannotBeApplied", () => {
		it("Should not Throw", async () => {
			await expect(handler.throwIfCannotBeApplied(actual, senderWallet)).toResolve();
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
						blockHeight: 1234,
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
