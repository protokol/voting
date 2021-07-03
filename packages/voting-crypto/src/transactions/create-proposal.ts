import { Utils } from "@arkecosystem/crypto";
import { Asserts } from "@protokol/utils";
import ByteBuffer from "bytebuffer";

import { VotingStaticFees, VotingTransactionTypes } from "../enums";
import { ICreateProposal } from "../interfaces";
import { AbstractVotingTransaction } from "./abstract-transaction";

export class CreateProposalTransaction extends AbstractVotingTransaction {
	public static readonly type: number = VotingTransactionTypes.CreateProposal;
	public static readonly key: string = "CreateProposal";

	protected static readonly defaultStaticFee = Utils.BigNumber.make(VotingStaticFees.CreateProposal);

	public static getAssetSchema(): Record<string, any> {
		return {
			type: "object",
			required: ["votingCreateProposal"],
			properties: {
				votingCreateProposal: {
					type: "object",
					required: ["duration", "content"],
					properties: {
						duration: {
							type: "object",
							required: ["blockHeight"],
							properties: {
								blockHeight: {
									bignumber: {
										minimum: 1,
									},
								},
							},
						},
						content: {
							allOf: [{ minLength: 2, maxLength: 90 }, { $ref: "base58" }],
						},
					},
				},
			},
		};
	}

	public serialize(): ByteBuffer {
		const { data } = this;

		Asserts.assert.defined<ICreateProposal>(data.asset?.votingCreateProposal);
		const createProposalAsset: ICreateProposal = data.asset.votingCreateProposal;

		const ipfsBuffer: Buffer = Buffer.from(createProposalAsset.content);

		const buffer: ByteBuffer = new ByteBuffer(1 + ipfsBuffer.length + 8, true);

		buffer.writeUint64(createProposalAsset.duration.blockHeight.toString());

		buffer.writeUint8(ipfsBuffer.length);
		buffer.append(ipfsBuffer, "hex");

		return buffer;
	}

	public deserialize(buf: ByteBuffer): void {
		const { data } = this;

		const blockHeight = Utils.BigNumber.make(buf.readUint64());

		const ipfsSize = buf.readUint8();
		const ipfs = buf.readBytes(ipfsSize).toBuffer().toString("utf8");

		data.asset = {
			votingCreateProposal: {
				duration: {
					blockHeight,
				},
				content: ipfs,
			} as ICreateProposal,
		};
	}
}
