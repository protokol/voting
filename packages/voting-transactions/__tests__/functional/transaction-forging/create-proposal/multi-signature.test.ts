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

describe("Create Proposal Functional Tests - Signed with Multi Signature", () => {
	it("Should Broadcast, Accept and Forge it [Signed with 1 Passphrase]", async () => {
		// Register a multi signature wallet with defaults
		const passphrase = generateMnemonic();
		const secrets = [passphrase, passphrases[4]!, passphrases[5]!];
		const participants = [
			Identities.PublicKey.fromPassphrase(secrets[0]!),
			Identities.PublicKey.fromPassphrase(secrets[1]!),
			Identities.PublicKey.fromPassphrase(secrets[2]!),
		];

		// Funds to register a multi signature wallet
		const initialFunds = VotingTransactionFactory.initialize(app)
			.transfer(Identities.Address.fromPassphrase(passphrase), 50 * 1e9)
			.withPassphrase(passphrases[0]!)
			.createOne();

		await expect(initialFunds).toBeAccepted();
		await snoozeForBlock(1);
		await expect(initialFunds.id).toBeForged();

		// Registering a multi-signature wallet
		const multiSignature = VotingTransactionFactory.initialize(app)
			.multiSignature(participants, 3)
			.withPassphrase(passphrase)
			.withPassphraseList(secrets)
			.createOne();

		await expect(multiSignature).toBeAccepted();
		await snoozeForBlock(1);
		await expect(multiSignature.id).toBeForged();

		// Send funds to multi signature wallet
		const multiSigAddress = Identities.Address.fromMultiSignatureAsset(multiSignature.asset!.multiSignature!);
		const multiSigPublicKey = Identities.PublicKey.fromMultiSignatureAsset(multiSignature.asset!.multiSignature!);

		const multiSignatureFunds = VotingTransactionFactory.initialize(app)
			.transfer(multiSigAddress, 100 * 1e8)
			.withPassphrase(passphrases[0]!)
			.createOne();

		await expect(multiSignatureFunds).toBeAccepted();
		await snoozeForBlock(1);
		await expect(multiSignatureFunds.id).toBeForged();

		const registration = VotingTransactionFactory.initialize(app)
			.CreateProposal({
				duration: {
					blockHeight: 1234,
				},
				content: "qw12312",
			})
			.withSenderPublicKey(multiSigPublicKey)
			.withPassphraseList(secrets)
			.createOne();

		await expect(registration).toBeAccepted();
		await snoozeForBlock(1);
		await expect(registration.id).toBeForged();
	});
});
