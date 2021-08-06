import { Container, Contracts, Enums, Providers } from "@arkecosystem/core-kernel";
import { Connection, createConnection } from "typeorm";

import { EventFactory } from "./events";

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
		const eventFactory = new EventFactory();
		this.events.listenMany([
			[Enums.BlockEvent.Applied, eventFactory.blockAppliedEvent(this.walletRepository)],
			[Enums.BlockEvent.Reverted, eventFactory.blockRevertEvent()],
		]);
	}
}
