import { Controller } from "@arkecosystem/core-api";
import { Container, Contracts } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
import Hapi from "@hapi/hapi";
import { Enums } from "@protokol/voting-crypto";

import { ApiErrors } from "../errors";
import { ResourceWithBlock } from "../resources";
import { VotingTransactionResource } from "../resources";
import { WalletResource } from "../resources";

@Container.injectable()
export class BaseController extends Controller {
	@Container.inject(Container.Identifiers.TransactionHistoryService)
	protected readonly transactionHistoryService!: Contracts.Shared.TransactionHistoryService;

	@Container.inject(Container.Identifiers.BlockHistoryService)
	private readonly blockHistoryService!: Contracts.Shared.BlockHistoryService;

	@Container.inject(Container.Identifiers.WalletRepository)
	@Container.tagged("state", "blockchain")
	private readonly walletRepository!: Contracts.State.WalletRepository;

	public async votingTransactions(
		request: Hapi.Request,
		transactionType: Enums.VotingTransactionTypes,
	): Promise<any> {
		const criteria: Contracts.Shared.TransactionCriteria = {
			...request.query,
			typeGroup: Enums.VotingTransactionGroup,
			type: transactionType,
		};

		return this.paginateWithBlock(
			criteria,
			this.getListingOrder(request),
			this.getListingPage(request),
			request.query.transform,
			VotingTransactionResource,
		);
	}

	public async singleTransaction(request: Hapi.Request, transactionType: Enums.VotingTransactionTypes): Promise<any> {
		const transaction = await this.transactionHistoryService.findOneByCriteria({
			...request.query,
			typeGroup: Enums.VotingTransactionGroup,
			type: transactionType,
			id: request.params.id,
		});

		if (!transaction) {
			return ApiErrors.TransactionDoesntExists;
		}

		return this.respondWithBlockResource(transaction, request.query.transform, VotingTransactionResource);
	}

	public async showByWalletId(request: Hapi.Request, indexer: string): Promise<any> {
		let wallet: Contracts.State.Wallet;
		try {
			wallet = this.walletRepository.findByIndex(indexer, request.params.id);
		} catch (e) {
			return ApiErrors.WalletDoesntExists;
		}

		return this.respondWithResource(wallet, WalletResource);
	}

	public async paginateWithBlock(
		criteria: Contracts.Shared.TransactionCriteria | Contracts.Shared.TransactionCriteria[],
		order: Contracts.Search.Sorting,
		page: Contracts.Search.Pagination,
		transform: boolean,
		resource: any,
	): Promise<any> {
		if (transform) {
			const transactionListResult = await this.transactionHistoryService.listByCriteriaJoinBlock(
				criteria,
				order,
				page,
			);
			return this.toPagination(transactionListResult, ResourceWithBlock(resource), true);
		} else {
			const transactionListResult = await this.transactionHistoryService.listByCriteria(criteria, order, page);
			return this.toPagination(transactionListResult, resource, false);
		}
	}

	public async respondWithBlockResource(
		transaction: Interfaces.ITransactionData,
		transform: boolean,
		resource: any,
	): Promise<any> {
		if (transform) {
			const blockData = await this.blockHistoryService.findOneByCriteria({ id: transaction.blockId });
			return this.respondWithResource({ data: transaction, block: blockData }, ResourceWithBlock(resource), true);
		} else {
			return this.respondWithResource(transaction, resource, false);
		}
	}
}
