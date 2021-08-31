import { Utils } from "@arkecosystem/crypto";
import { Asserts } from "@protokol/utils";
import ByteBuffer from "bytebuffer";

import { VotingStaticFees, VotingTransactionTypes } from "../enums";
import { ICastVote } from "../interfaces";
import { AbstractVotingTransaction } from "./abstract-transaction";

export class CastVoteTransaction extends AbstractVotingTransaction {
	public static override readonly type: number = VotingTransactionTypes.CastVote;
	public static override readonly key: string = "CastVote";

	protected static override readonly defaultStaticFee = Utils.BigNumber.make(VotingStaticFees.CastVote);

	public static override getAssetSchema(): Record<string, any> {
		return {
			type: "object",
			required: ["votingCastVote"],
			properties: {
				votingCastVote: {
					type: "object",
					required: ["proposalId", "decision"],
					properties: {
						proposalId: {
							$ref: "transactionId",
						},
						decision: {
							type: "string",
							votingSchema: true,
						},
					},
				},
			},
		};
	}

	public serialize(): ByteBuffer {
		const { data } = this;

		Asserts.assert.defined<ICastVote>(data.asset?.votingCastVote);

		const castVoteAsset: ICastVote = data.asset.votingCastVote;

		const decisionBuffer: Buffer = Buffer.from(castVoteAsset.decision, "utf8");

		const buffer: ByteBuffer = new ByteBuffer(32 + 1 + decisionBuffer.length, true);

		buffer.append(castVoteAsset.proposalId, "hex");

		buffer.writeUint8(decisionBuffer.length);
		buffer.append(decisionBuffer, "utf8");

		return buffer;
	}

	public deserialize(buf: ByteBuffer): void {
		const { data } = this;

		const proposalId = buf.readBytes(32).toString("hex");

		const decisionLength: number = buf.readUInt8();
		const decision = buf.readBytes(decisionLength).toString("utf8");

		data.asset = {
			votingCastVote: {
				proposalId,
				decision,
			},
		};
	}
}
