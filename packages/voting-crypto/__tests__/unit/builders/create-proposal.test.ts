import { Managers, Transactions, Utils } from "@arkecosystem/crypto";

import { Builders, Transactions as VotingTransactions } from "../../../src";

beforeAll(() => {
	Managers.configManager.setFromPreset("testnet" as any);
	Managers.configManager.setHeight(2);
	Transactions.TransactionRegistry.registerTransactionType(VotingTransactions.CreateProposalTransaction);
});

describe("CreateProposal Builder Tests", () => {
	describe("Builder Verification Tests", () => {
		it("Should Verify Correctly - Without vendorField", () => {
			const actual = new Builders.CreateProposalBuilder()
				.createProposal({
					duration: {
						blockHeight: 1234,
					},
					content: "qw12312",
				})
				.nonce("4")
				.sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire");

			expect(actual.build().verified).toBeTruthy();
			expect(actual.verify()).toBeTruthy();
		});

		it("Should Verify Correctly - With vendorField", () => {
			const actual = new Builders.CreateProposalBuilder()
				.createProposal({
					duration: {
						blockHeight: 1234,
					},
					content: "qw12312",
				})
				.vendorField("Registration Builder")
				.nonce("4")
				.sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire");

			expect(actual.build().verified).toBeTruthy();
			expect(actual.verify()).toBeTruthy();
		});

		it("Should Verify Correctly - With Different Fee", () => {
			const actual = new Builders.CreateProposalBuilder()
				.createProposal({
					duration: {
						blockHeight: 1234,
					},
					content: "qw12312",
				})
				.vendorField("Registration Builder")
				.fee("12345")
				.nonce("4")
				.sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire");

			expect(actual.build().verified).toBeTruthy();
			expect(actual.verify()).toBeTruthy();
		});
	});
});
