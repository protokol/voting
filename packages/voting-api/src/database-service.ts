import { Container, Contracts, Enums, Providers } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
import { Indexers } from "@protokol/voting-transactions";
import { Connection, createConnection, getRepository } from "typeorm";

import { BlockBalance } from "./entities";

const pluginName = require("../package.json").name;

@Container.injectable()
export class DatabaseService {
	@Container.inject(Container.Identifiers.PluginConfiguration)
	@Container.tagged("plugin", pluginName)
	protected readonly configuration!: Providers.PluginConfiguration;

	@Container.inject(Container.Identifiers.EventDispatcherService)
	private events!: Contracts.Kernel.EventDispatcher;

	@Container.inject(Container.Identifiers.WalletRepository)
	@Container.tagged("state", "blockchain")
	private readonly walletRepository!: Contracts.State.WalletRepository;

	private connection?: Connection;

	public async initialize(): Promise<void> {
		await this.connect();
		this.setupListeners();
	}

	private async connect(): Promise<void> {
		this.connection = await createConnection({
			type: "better-sqlite3",
			database: this.configuration.get<string>("dbFilename")!,
			entities: [__dirname + "/entities/*.js"],
			synchronize: false,
			migrationsRun: true,
			migrations: [__dirname + "/migrations/*.js"],
		});
	}

	public async disconnect(): Promise<void> {
		await this.connection?.close();
	}

	private setupListeners(): void {
		const blockBalancesRepository = getRepository(BlockBalance);
		this.events.listenMany([
			[
				Enums.BlockEvent.Applied,
				{
					handle: async ({ data }: { data: Interfaces.IBlockData }) => {
						const filteredProposals = this.walletRepository
							.getIndex(Indexers.createProposalVotingWalletIndex)
							.entries()
							.reduce((proposals, [id, wallet]) => {
								const proposal = wallet.getAttribute("voting.proposal")[id];
								if (proposal.proposal.duration.blockHeight === data.height) {
									const blockBalance = new BlockBalance(
										id,
										data.id!,
										proposal.agree.map((publicKey) => ({
											publicKey,
											balance: this.walletRepository.findByPublicKey(publicKey).getBalance(),
										})),
										proposal.disagree.map((publicKey) => ({
											publicKey,
											balance: this.walletRepository.findByPublicKey(publicKey).getBalance(),
										})),
									);
									proposals.push(blockBalance);
								}
								return proposals;
							}, [] as BlockBalance[]);
						if (filteredProposals.length) {
							await blockBalancesRepository.insert(filteredProposals);
						}
					},
				},
			],
			[
				Enums.BlockEvent.Reverted,
				{
					handle: async ({ data }: { data: Interfaces.IBlockData }) =>
						await blockBalancesRepository.delete({ blockId: data.id }),
				},
			],
		]);
	}
}
