import { Application, Container } from "@arkecosystem/core-kernel";
import { Wallets } from "@arkecosystem/core-state";
import { passphrases } from "@arkecosystem/core-test-framework";
import Hapi from "@hapi/hapi";
import { Indexers } from "@protokol/voting-transactions";

import { StatisticsController } from "../../../src/controllers";
import { ApiErrors } from "../../../src/errors";
import { buildWallet } from "../__support__";
import { initApp, ItemResponse } from "../__support__";

let app: Application;

let configurationsController: StatisticsController;

let walletRepository: Wallets.WalletRepository;

beforeAll(() => {
	app = initApp();

	configurationsController = app.resolve<StatisticsController>(StatisticsController);

	walletRepository = app.get<Wallets.WalletRepository>(Container.Identifiers.WalletRepository);
});
describe("Statistics Controller", () => {
	describe("Should Test Statistics Controller Return", () => {
		it("Should Return Correct Response", async () => {
			const dummyContentWallet = buildWallet(app, passphrases[1]!);
			const dummyContentData = {};
			dummyContentData["0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5"] = {
				proposal: {
					duration: {
						blockHeight: 123,
					},
					content: "stringqwer123",
				},
				voters: [],
				agree: 0,
				disagree: 0,
			};
			dummyContentWallet.setAttribute("voting.proposal", dummyContentData);
			walletRepository.setOnIndex(
				Indexers.createProposalVotingWalletIndex,
				"0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5",
				dummyContentWallet,
			);
			const request: Hapi.Request = {
				params: {
					id: "0f3bdaef56214296c191fc842adf50018f55dc6be04892dd92fb48874aabf8f5",
				},
			};
			const response = (await configurationsController.statistics(request)) as ItemResponse;

			expect(response).toBeObject();
			expect(response).not.toBeEmpty();
		});

		it("should return 404 response", async () => {
			const request: Hapi.Request = {
				params: {
					id: "falseID",
				},
			};
			const response = await configurationsController.statistics(request);

			expect(response).toBe(ApiErrors.ProposalDoesntExists);
		});
	});
});
