import { Container, Contracts, Providers } from "@arkecosystem/core-kernel";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Managers, Utils } from "@arkecosystem/crypto";

import { FeeType } from "../enums";
import { VotingTransactionErrors } from "../errors";

const pluginName = require("../../package.json").name;

export abstract class VotingAbstractTransactionHandler extends Handlers.TransactionHandler {
	@Container.inject(Container.Identifiers.PluginConfiguration)
	@Container.tagged("plugin", pluginName)
	protected readonly configuration!: Providers.PluginConfiguration;

	@Container.inject(Container.Identifiers.TransactionHistoryService)
	private readonly transactionHistoryService!: Contracts.Shared.TransactionHistoryService;

	public async isActivated(): Promise<boolean> {
		return Managers.configManager.getMilestone().aip11 === true;
	}

	protected getDefaultCriteria(): { typeGroup: number | undefined; type: number | undefined } {
		return {
			typeGroup: this.getConstructor().typeGroup,
			type: this.getConstructor().type,
		};
	}

	public override dynamicFee({
		addonBytes,
		satoshiPerByte,
		transaction,
		height,
	}: Contracts.Shared.DynamicFeeContext): Utils.BigNumber {
		const feeType = this.configuration.get<FeeType>("feeType");

		if (feeType === FeeType.Static) {
			return this.getConstructor().staticFee({ height });
		}

		if (feeType === FeeType.None) {
			return Utils.BigNumber.ZERO;
		}

		return super.dynamicFee({ addonBytes, satoshiPerByte, transaction, height });
	}

	public override async throwIfCannotBeApplied(
		transaction: Interfaces.ITransaction,
		wallet: Contracts.State.Wallet,
	): Promise<void> {
		const feeType = this.configuration.get<FeeType>("feeType");

		if (feeType === FeeType.Static) {
			const staticFee = this.getConstructor().staticFee();

			if (!transaction.data.fee.isEqualTo(staticFee)) {
				throw new VotingTransactionErrors.StaticFeeMismatchError(staticFee.toFixed());
			}
		}
		return super.throwIfCannotBeApplied(transaction, wallet);
	}

	public async applyToRecipient(
		transaction: Interfaces.ITransaction,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
	): Promise<void> {}

	public async revertForRecipient(
		transaction: Interfaces.ITransaction,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
	): Promise<void> {}

	public async bootstrap(): Promise<void> {
		const transactionStream = this.transactionHistoryService.streamByCriteria(this.getDefaultCriteria());
		for await (const transaction of transactionStream) {
			await this.applyVotingTransaction(transaction);
		}
	}

	public override async apply(transaction: Interfaces.ITransaction): Promise<void> {
		await super.apply(transaction);
		await this.applyVotingTransaction(transaction.data);
	}

	public override async revert(transaction: Interfaces.ITransaction): Promise<void> {
		await super.revert(transaction);
		await this.revertVotingTransaction(transaction.data);
	}

	public abstract applyVotingTransaction(transaction: Interfaces.ITransactionData): Promise<void>;

	public abstract revertVotingTransaction(transaction: Interfaces.ITransactionData): Promise<void>;
}
