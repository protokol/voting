import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";
import ByteBuffer from "bytebuffer";

import { VotingAbstractTransactionHandler } from "../../../../src/handlers";

const { schemas } = Transactions;

export class DummyVotingTrx extends Transactions.Transaction {
	static type = 1;
	static typeGroup = 10000;
	static version = 2;
	static key = "Dummy";

	static defaultStaticFee = Utils.BigNumber.make(200000);

	public static getSchema(): Transactions.schemas.TransactionSchema {
		return schemas.extend(schemas.transactionBaseSchema, {
			$id: this.key,
			required: ["typeGroup"],
			properties: {
				type: { transactionType: this.type },
				typeGroup: { const: this.typeGroup },
				amount: { bignumber: { minimum: 0, maximum: 0 } },
			},
		} as any);
	}

	public serialize(): ByteBuffer {
		return new ByteBuffer(0);
	}

	public deserialize(buf: ByteBuffer): void {}
}

export class DummyVotingBuilder extends Transactions.TransactionBuilder<DummyVotingBuilder> {
	public constructor() {
		super();
		this.data.version = DummyVotingTrx.version;
		this.data.typeGroup = DummyVotingTrx.typeGroup;
		this.data.type = DummyVotingTrx.type;
		this.data.amount = Utils.BigNumber.ZERO;
		this.data.fee = DummyVotingTrx.staticFee();
	}

	public getStruct(): Interfaces.ITransactionData {
		const struct: Interfaces.ITransactionData = super.getStruct();
		struct.amount = this.data.amount;

		return struct;
	}

	protected instance(): DummyVotingBuilder {
		return this;
	}
}

export class DummyVotingTransaction extends VotingAbstractTransactionHandler {
	public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
		return [];
	}

	public walletAttributes(): ReadonlyArray<string> {
		return [];
	}

	getConstructor(): Transactions.TransactionConstructor {
		return DummyVotingTrx;
	}

	applyVotingTransaction(transaction: Interfaces.ITransactionData): Promise<void> {
		return Promise.resolve();
	}

	revertVotingTransaction(transaction: Interfaces.ITransactionData): Promise<void> {
		return Promise.resolve();
	}
}
