import { Managers, Transactions } from "@arkecosystem/crypto";

import { Builders, Transactions as VotingTransactions } from "../../../src";

beforeAll(() => {
	Managers.configManager.setFromPreset("testnet" as any);
	Managers.configManager.setHeight(2);
	Transactions.TransactionRegistry.registerTransactionType(VotingTransactions.CastVoteTransaction);
});

describe("Cast Vote Builder Tests", () => {
	describe("Builder Verification Tests", () => {
		it("Should Verify Correctly - Without vendorField", () => {
			const actual = new Builders.CastVoteBuilder()
				.castVote({
					proposalId: "dfa8cbc8bba806348ebf112a4a01583ab869cccf72b72f7f3d28af9ff902d06d",
					decision: "yes",
				})
				.nonce("4")
				.sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire");

			expect(actual.build().verified).toBeTruthy();
			expect(actual.verify()).toBeTruthy();
		});

		it("Should Verify Correctly - With vendorField", () => {
			const actual = new Builders.CastVoteBuilder()
				.castVote({
					proposalId: "dfa8cbc8bba806348ebf112a4a01583ab869cccf72b72f7f3d28af9ff902d06d",
					decision: "yes",
				})
				.vendorField("Registration Builder")
				.nonce("4")
				.sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire");

			expect(actual.build().verified).toBeTruthy();
			expect(actual.verify()).toBeTruthy();
		});

		it("Should Verify Correctly - With Different Fee", () => {
			const actual = new Builders.CastVoteBuilder()
				.castVote({
					proposalId: "dfa8cbc8bba806348ebf112a4a01583ab869cccf72b72f7f3d28af9ff902d06d",
					decision: "yes",
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
