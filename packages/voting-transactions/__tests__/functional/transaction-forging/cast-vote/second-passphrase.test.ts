import "@arkecosystem/core-test-framework/dist/matchers";

import { Contracts } from "@arkecosystem/core-kernel";
import { passphrases, snoozeForBlock } from "@arkecosystem/core-test-framework";
import { Identities } from "@arkecosystem/crypto";
import { generateMnemonic } from "bip39";

import * as support from "../../__support__";
import { VotingTransactionFactory } from "../../__support__/transaction-factory";

let app: Contracts.Kernel.Application;
beforeAll(async () => (app = await support.setUp()));
afterAll(async () => await support.tearDown());

describe("Create Proposal Functional Tests - Signed with 2 Passphrases", () => {
	it("Should Broadcast, Accept and Forge it [Signed with 2 Passphrases]", async () => {
		// Prepare a fresh wallet for the tests
		const passphrase = generateMnemonic();
		const secondPassphrase = generateMnemonic();

		// Initial Funds
		const initialFunds = VotingTransactionFactory.initialize(app)
			.transfer(Identities.Address.fromPassphrase(passphrase), 150 * 1e9)
			.withPassphrase(passphrases[0]!)
			.createOne();

		await expect(initialFunds).toBeAccepted();
		await snoozeForBlock(1);
		await expect(initialFunds.id).toBeForged();

		// Register a second passphrase
		const secondSignature = VotingTransactionFactory.initialize(app)
			.secondSignature(secondPassphrase)
			.withPassphrase(passphrase)
			.createOne();

		await expect(secondSignature).toBeAccepted();
		await snoozeForBlock(1);
		await expect(secondSignature.id).toBeForged();

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

		const castVote = VotingTransactionFactory.initialize(app)
			.CastVote({
				proposalId: createProposal.id!,
				decision: "yes",
			})
			.withPassphrase(passphrase)
			.withSecondPassphrase(secondPassphrase)
			.createOne();

		await expect(castVote).toBeAccepted();
		await snoozeForBlock(1);
		await expect(castVote.id).toBeForged();
	});
});
