import { Utils } from "@arkecosystem/crypto";
import ByteBuffer from "bytebuffer";

import { VotingStaticFees, VotingTransactionTypes } from "../enums";
import { AbstractVotingTransaction } from "./abstract-transaction";

export class CastVoteTransaction extends AbstractVotingTransaction {
	public static readonly type: number = VotingTransactionTypes.CreateProposal;
	public static readonly key: string = "CastVote";

	protected static readonly defaultStaticFee = Utils.BigNumber.make(VotingStaticFees.CreateProposal);

	public static getAssetSchema(): Record<string, any> {
		return {
			type: "object",
			required: ["votingCastVote"],
			properties: {
				votingCastVote: {
					type: "object",
					required: ["proposalId", "decision"],
				},
			},
		};
	}

	public serialize(): ByteBuffer {
		return new ByteBuffer(0);
	}

	public deserialize(buf: ByteBuffer): void {
		const { data } = this;

		data.asset = {
			votingCastVote: {},
		};
	}
}
