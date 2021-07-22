import "@arkecosystem/core-test-framework/dist/matchers";

import { Contracts } from "@arkecosystem/core-kernel";
import { passphrases, snoozeForBlock } from "@arkecosystem/core-test-framework";

import * as support from "../../__support__";
import { VotingTransactionFactory } from "../../__support__/transaction-factory";

let app: Contracts.Kernel.Application;
beforeAll(async () => (app = await support.setUp()));
afterAll(async () => await support.tearDown());

describe("CastVote Functional Tests - Signed with one Passphrase", () => {
	let proposalId;
	it("Should Broadcast, Accept and Forge it [Signed with 1 Passphrase]", async () => {
		const createProposal = VotingTransactionFactory.initialize(app)
			.CreateProposal({
				duration: {
					blockHeight: 1234,
				},
				content: "qw12312",
			})
			.withPassphrase(passphrases[1]!)
			.createOne();

		await expect(createProposal).toBeAccepted();
		await snoozeForBlock(1);
		await expect(createProposal.id).toBeForged();

		proposalId = createProposal.id;

		const castVote = VotingTransactionFactory.initialize(app)
			.CastVote({
				proposalId: createProposal.id!,
				decision: "yes",
			})
			.withPassphrase(passphrases[1]!)
			.createOne();

		await expect(castVote).toBeAccepted();
		await snoozeForBlock(1);
		await expect(castVote.id).toBeForged();
	});

	it("Should Not Be Broadcast, Accept and Forge it - Because Wallet Already Voted", async () => {
		const registration = VotingTransactionFactory.initialize(app)
			.CastVote({
				proposalId: proposalId,
				decision: "no",
			})
			.withPassphrase(passphrases[1]!)
			.createOne();

		await expect(registration).not.toBeAccepted();
		await snoozeForBlock(1);
		await expect(registration.id).not.toBeForged();
	});
});
