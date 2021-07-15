import { Application, Container, Contracts } from "@arkecosystem/core-kernel";
import { Wallets } from "@arkecosystem/core-state";
import Hapi from "@hapi/hapi";
import { Indexers } from "@protokol/voting-transactions";

import { CastVoteController } from "../../../src/controllers";
import { blockHistoryService, initApp, ItemResponse, transactionHistoryService } from "../__support__";

let app: Application;

let createProposalController: CastVoteController;

beforeAll(() => {
	app = initApp();

	createProposalController = app.resolve<CastVoteController>(CastVoteController);
});
describe("Cast Vote Controller", () => {
	describe("Should Test Transactions Method", () => {
		it("Should Return Correct Response", async () => {
			transactionHistoryService.listByCriteriaJoinBlock.mockResolvedValueOnce({
				results: [
					{
						data: {
							id: "id123",
							senderPublicKey: "pubKey",
							asset: { votingCastVote: {} },
						},
						block: { timestamp: 123 },
					},
				],
			});

			const request: Hapi.Request = {
				query: {
					page: 1,
					limit: 100,
					transform: true,
				},
			};

			const response = await createProposalController.transactions(request);

			expect(response.results).toBeArray();
			expect(response.results).not.toBeEmpty();
		});
	});

	describe("Should Test Single Transaction Method", () => {
		it("Should Return Correct Response", async () => {
			blockHistoryService.findOneByCriteria.mockResolvedValueOnce({ timestamp: 123 });
			transactionHistoryService.findOneByCriteria.mockResolvedValueOnce({
				id: "id123",
				senderPublicKey: "pubKey",
				asset: { votingCastVote: {} },
				blockId: "blockID123",
			});

			const request: Hapi.Request = {
				query: {
					transform: true,
				},
				params: {
					id: "id123",
				},
			};

			const response = await createProposalController.transaction(request);

			expect(response).toBeObject();
			expect(response).not.toBeEmpty();
		});
	});

	describe("Should Test Wallet Method", () => {
		it("Should Return Correct Response", async () => {
			const walletRepository = app.get<Wallets.WalletRepository>(Container.Identifiers.WalletRepository);
			walletRepository.setOnIndex(Indexers.castVoteVotingWalletIndex, "senderPublicKeyID", {
				empty: "wallet",
			} as unknown as Contracts.State.Wallet);
			const request: Hapi.Request = {
				query: {},
				params: {
					walletId: "otherSenderPublicKeyID",
				},
			};

			const response = await createProposalController.wallet(request);

			expect(response).toBeObject();
		});
	});
});
