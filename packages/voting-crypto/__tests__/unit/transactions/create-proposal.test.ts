import { Managers, Transactions } from "@arkecosystem/crypto";
import Buffer from "buffer";

import { CreateProposalBuilder } from "../../../src/builders";
import { CreateProposalTransaction } from "../../../src/transactions";
import { Utils } from "@arkecosystem/crypto";

beforeAll(() => {
	Managers.configManager.setFromPreset("testnet" as any);
	Managers.configManager.setHeight(2);
	Transactions.TransactionRegistry.registerTransactionType(CreateProposalTransaction);
});

describe("Create Proposal Transaction Tests", () => {
	describe("Serialisation and De-Serialisation", () => {
		it("Should Serialise and De-Serialise Built Transaction", () => {
			const actual = new CreateProposalBuilder()
				.createProposal({
					duration: {
						blockHeight: Utils.BigNumber.make(1234),
					},
					content: "qw12312",
				})
				.vendorField("Registration Transaction")
				.nonce("4")
				.sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire")
				.getStruct();

			const serialized: Buffer = Transactions.TransactionFactory.fromData(actual as any).serialized;
			const deserialized = Transactions.Deserializer.deserialize(serialized.toString("hex"));

			expect(deserialized.data.asset?.votingCreateProposal).toStrictEqual({
				duration: {
					blockHeight: Utils.BigNumber.make(1234),
				},
				content: "qw12312",
			});
		});

		it("Should Throw if Asset is not Correct", () => {
			const actual = new CreateProposalBuilder()
				.createProposal({
					duration: {
						blockHeight: Utils.BigNumber.make(1234),
					},
					content: "qw12312",
				})
				.nonce("3");

			actual.data.asset = {
				duration: {
					blockHeight: 777,
				},
				content: "qw12312",
			};
			expect(() =>
				actual.sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire").build(),
			).toThrow();
		});
	});
});
