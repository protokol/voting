import "@arkecosystem/core-test-framework/dist/matchers";

import { Contracts } from "@arkecosystem/core-kernel";
import { passphrases, snoozeForBlock } from "@arkecosystem/core-test-framework";

import * as support from "../../__support__";
import { VotingTransactionFactory } from "../../__support__/transaction-factory";

let app: Contracts.Kernel.Application;
beforeAll(async () => (app = await support.setUp()));
afterAll(async () => await support.tearDown());

describe("Cast Vote Functional Tests - Signed with one Passphrase", () => {
	it("Should Broadcast, Accept and Forge it [Signed with 1 Passphrase]", async () => {
		const createProposal = VotingTransactionFactory.initialize(app)
			.CreateProposal({
				duration: {
					blockHeight: 1234,
				},
				content: "qw12312",
			})
			.withVendorField("VendorField test -> [CreateProposal]")
			.withPassphrase(passphrases[1]!)
			.createOne();

		await expect(createProposal).toBeAccepted();
		await snoozeForBlock(1);
		await expect(createProposal.id).toBeForged();

		const castVote = VotingTransactionFactory.initialize(app)
			.CastVote({
				proposalId: createProposal.id!,
				decision: "yes",
			})
			.withVendorField("VendorField test -> [CastVote]")
			.withPassphrase(passphrases[1]!)
			.createOne();

		await expect(castVote).toBeAccepted();
		await snoozeForBlock(1);
		await expect(castVote.id).toBeForged();
	});
});
