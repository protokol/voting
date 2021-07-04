import { Utils } from "@arkecosystem/crypto";
import { Asserts } from "@protokol/utils";
import ByteBuffer from "bytebuffer";

import { VotingStaticFees, VotingTransactionTypes } from "../enums";
import { ICastVote } from "../interfaces";
import { AbstractVotingTransaction } from "./abstract-transaction";

export class CastVoteTransaction extends AbstractVotingTransaction {
	public static readonly type: number = VotingTransactionTypes.CastVote;
	public static readonly key: string = "CastVote";

	protected static readonly defaultStaticFee = Utils.BigNumber.make(VotingStaticFees.CastVote);

	public static getAssetSchema(): Record<string, any> {
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

		const decisionBuffer: Buffer = Buffer.from(castVoteAsset.decision);

		const buffer: ByteBuffer = new ByteBuffer(32 + decisionBuffer.length, true);

		buffer.append(castVoteAsset.proposalId);

		buffer.writeUint8(decisionBuffer.length);
		buffer.append(castVoteAsset.decision);

		return buffer;
	}

	public deserialize(buf: ByteBuffer): void {
		const { data } = this;

		const proposalId = buf.readBytes(32).toString("hex");

		const decisionLength: number = buf.readUInt8();
		const decision = buf.readBytes(decisionLength).toString("hex");

		data.asset = {
			votingCastVote: {
				proposalId,
				decision,
			},
		};
	}
}
