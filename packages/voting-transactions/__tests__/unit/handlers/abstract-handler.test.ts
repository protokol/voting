import { Application, Container, Contracts, Providers } from "@arkecosystem/core-kernel";
import { Wallets } from "@arkecosystem/core-state";
import { passphrases } from "@arkecosystem/core-test-framework";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Managers, Transactions, Utils } from "@arkecosystem/crypto";

import { FeeType } from "../../../src/enums";
import { StaticFeeMismatchError } from "../../../src/errors/transactions";
import { VotingAbstractTransactionHandler } from "../../../src/handlers";
import { buildWallet, initApp } from "../__support__/app";
// eslint-disable-next-line jest/no-mocks-import
import { DummyVotingBuilder, DummyVotingTransaction, DummyVotingTrx } from "./__mocks__/dummy";

let app: Application;

let senderWallet: Contracts.State.Wallet;

let transactionHandlerRegistry: Handlers.Registry;

let handler: Handlers.TransactionHandler;

let actual: Interfaces.ITransaction;

let walletRepository: Wallets.WalletRepository;

const transactionHistoryService = {
	streamByCriteria: jest.fn(),
};

beforeEach(async () => {
	app = initApp();
	app.bind(Container.Identifiers.TransactionHistoryService).toConstantValue(transactionHistoryService);

	walletRepository = app.get<Wallets.WalletRepository>(Container.Identifiers.WalletRepository);

	senderWallet = buildWallet(app, passphrases[0]!);
	walletRepository.index(senderWallet);

	app.bind(Container.Identifiers.TransactionHandler).to(DummyVotingTransaction);

	transactionHandlerRegistry = app.get<Handlers.Registry>(Container.Identifiers.TransactionHandlerRegistry);

	handler = transactionHandlerRegistry.getRegisteredHandlerByType(
		Transactions.InternalTransactionType.from(DummyVotingTrx.type, DummyVotingTrx.typeGroup),
		2,
	);
});

afterEach(() => {
	Transactions.TransactionRegistry.deregisterTransactionType(DummyVotingTrx);
});

describe("VotingAbstractTransactionHandler", () => {
	describe("isActivated", () => {
		it("Should Test if isActivated - AIP11 = true", async () => {
			Managers.configManager.getMilestone().aip11 = true;

			expect(await handler.isActivated()).toBeTrue();
		});

		it("Should Test if isActivated - AIP11 = false", async () => {
			Managers.configManager.getMilestone().aip11 = false;

			expect(await handler.isActivated()).toBeFalse();
		});
	});

	describe("dynamicFee", () => {
		let configs: Providers.PluginConfiguration;

		beforeEach(() => {
			actual = new DummyVotingBuilder().nonce("3").sign(passphrases[0]!).build();
			configs = app.get<Providers.PluginConfiguration>(Container.Identifiers.PluginConfiguration);
		});

		it("Should Test if it is Correct Dynamic Fee (Default Settings)", async () => {
			expect(
				handler.dynamicFee({
					transaction: actual,
					addonBytes: 150,
					satoshiPerByte: 3,
					height: 1,
				}),
			).toEqual(Utils.BigNumber.make((Math.round(actual.serialized.length / 2) + 150) * 3));
		});

		it("Should Test if it is Correct Static Fee", async () => {
			configs.set<FeeType>("feeType", FeeType.Static);

			expect(
				handler.dynamicFee({
					transaction: actual,
					addonBytes: 150,
					satoshiPerByte: 3,
					height: 1,
				}),
			).toEqual(Utils.BigNumber.make(handler.getConstructor().staticFee()));
		});

		it("Should Test if it is Correct with no Fee", async () => {
			configs.set<FeeType>("feeType", FeeType.None);

			expect(
				handler.dynamicFee({
					transaction: actual,
					addonBytes: 150,
					satoshiPerByte: 3,
					height: 1,
				}),
			).toEqual(Utils.BigNumber.ZERO);
		});
	});

	describe("throwIfCannotBeApplied", () => {
		let configs: Providers.PluginConfiguration;
		let builder: DummyVotingBuilder;

		beforeEach(() => {
			builder = new DummyVotingBuilder().nonce("1");
			configs = app.get<Providers.PluginConfiguration>(Container.Identifiers.PluginConfiguration);
		});

		it("Should not Throw", async () => {
			const transaction = builder.sign(passphrases[0]!).build();
			await expect(handler.throwIfCannotBeApplied(transaction, senderWallet)).toResolve();
		});

		it("Should Throw Static Fee Miss Match Error", async () => {
			configs.set<FeeType>("feeType", FeeType.Static);
			const transaction = builder.fee("100").sign(passphrases[0]!).build();

			await expect(handler.throwIfCannotBeApplied(transaction, senderWallet)).rejects.toThrowError(
				StaticFeeMismatchError,
			);
		});
	});

	describe("bootstrap", () => {
		it("Should Resolve", async () => {
			actual = new DummyVotingBuilder().nonce("1").sign(passphrases[0]!).build();

			transactionHistoryService.streamByCriteria.mockImplementationOnce(async function* () {
				yield actual.data;
			});

			await expect(handler.bootstrap()).toResolve();
		});
	});

	describe("apply", () => {
		it("Should Resolve", async () => {
			actual = new DummyVotingBuilder().nonce("1").sign(passphrases[0]!).build();

			await expect(handler.apply(actual)).toResolve();
		});
	});

	describe("revert", () => {
		it("Should Resolve", async () => {
			actual = new DummyVotingBuilder().nonce("1").sign(passphrases[0]!).build();
			await handler.apply(actual);

			await expect(handler.revert(actual)).toResolve();
		});
	});
});
