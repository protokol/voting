import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";

import { VotingTransactionGroup, VotingTransactionVersion } from "../enums";

export abstract class AbstractVotingBuilder<
	TBuilder extends Transactions.TransactionBuilder<TBuilder>,
> extends Transactions.TransactionBuilder<TBuilder> {
	protected constructor() {
		super();
		this.data.version = VotingTransactionVersion;
		this.data.typeGroup = VotingTransactionGroup;
		this.data.amount = Utils.BigNumber.ZERO;
	}

	public getStruct(): Interfaces.ITransactionData {
		const struct: Interfaces.ITransactionData = super.getStruct();
		struct.amount = this.data.amount;
		struct.asset = this.data.asset;
		struct.vendorField = this.data.vendorField;

		return struct;
	}
}
