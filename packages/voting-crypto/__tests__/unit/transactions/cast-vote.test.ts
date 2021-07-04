import { Managers, Transactions } from "@arkecosystem/crypto";
import Buffer from "buffer";

import { CastVoteBuilder } from "../../../src/builders";
import { CastVoteTransaction } from "../../../src/transactions";

beforeAll(() => {
	// The module should be loaded from root index file too register all necessary functions
	require("../../../src");

	Managers.configManager.setFromPreset("testnet" as any);
	Managers.configManager.setHeight(2);
	Transactions.TransactionRegistry.registerTransactionType(CastVoteTransaction);
});

describe("Cast Vote Transaction Tests", () => {
	describe("Serialisation and De-Serialisation", () => {
		it("Should Serialise and De-Serialise Built Transaction", () => {
			const actual = new CastVoteBuilder()
				.castVote({
					proposalId: "dfa8cbc8bba806348ebf112a4a01583ab869cccf72b72f7f3d28af9ff902d06d",
					decision: "no",
				})
				.vendorField("Registration Transaction")
				.nonce("4")
				.sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire")
				.getStruct();

			const serialized: Buffer = Transactions.TransactionFactory.fromData(actual as any).serialized;
			const deserialized = Transactions.Deserializer.deserialize(serialized.toString("hex"));

			expect(deserialized.data.asset?.votingCastVote).toStrictEqual({
				proposalId: "dfa8cbc8bba806348ebf112a4a01583ab869cccf72b72f7f3d28af9ff902d06d",
				decision: "no",
			});
		});

		it("Should Throw if Asset is not Correct", () => {
			const actual = new CastVoteBuilder()
				.castVote({
					proposalId: "dfa8cbc8bba806348ebf112a4a01583ab869cccf72b72f7f3d28af9ff902d06d",
					decision: "no",
				})
				.nonce("3");

			actual.data.asset = {
				proposalId: "dfa8cbc8bba806348ebf112a4a01583ab869cccf72b72f7f3d28af9ff902d06d",
				decision: "trolol",
			};
			expect(() =>
				actual.sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire").build(),
			).toThrow();
		});
	});
});
