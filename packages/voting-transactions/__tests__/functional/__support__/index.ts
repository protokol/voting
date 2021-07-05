import { Container, Contracts } from "@arkecosystem/core-kernel";
import { StateBuilder } from "@arkecosystem/core-state";
import { Sandbox } from "@arkecosystem/core-test-framework";
import { Managers } from "@arkecosystem/crypto";
import delay from "delay";

jest.setTimeout(1200000);

const sandbox: Sandbox = new Sandbox();

export const setUp = async (): Promise<Contracts.Kernel.Application> => {
	process.env.CORE_RESET_DATABASE = "1";

	sandbox.withCoreOptions({
		flags: {
			token: "ark",
			network: "unitnet",
			env: "test",
		},
		peers: {
			list: [{ ip: "127.0.0.1", port: 4000 }],
		},
		app: require("./app.json"),
	});
	await sandbox.boot(async ({ app }) => {
		await app.bootstrap({
			flags: {
				token: "ark",
				network: "unitnet",
				env: "test",
				processType: "core",
			},
		});

		Managers.configManager.getMilestone().aip11 = false;
		Managers.configManager.getMilestone().htlcEnabled = false;

		await app.boot();

		Managers.configManager.getMilestone().aip11 = true;
		Managers.configManager.getMilestone().htlcEnabled = true;
		Managers.configManager.getMilestone().vendorFieldLength = 255;
	});

	return sandbox.app;
};

export const tearDown = async (): Promise<void> => {
	const walletRepository = sandbox.app.getTagged<Contracts.State.WalletRepository>(
		Container.Identifiers.WalletRepository,
		"state",
		"blockchain",
	);

	const mapWallets = (wallet: Contracts.State.Wallet) => {
		const walletAttributes = wallet.getAttributes();
		if (walletAttributes.delegate) {
			delete walletAttributes.delegate;
		}
		return {
			publicKey: wallet.getPublicKey(),
			balance: wallet.getBalance(),
			nonce: wallet.getNonce(),
			attributes: walletAttributes,
		};
	};
	const sortWallets = (a: Contracts.State.Wallet, b: Contracts.State.Wallet) =>
		a.getPublicKey()!.localeCompare(b.getPublicKey()!);

	const allByPublicKey = walletRepository
		.allByPublicKey()
		.map((w) => w.clone())
		.sort(sortWallets)
		.map(mapWallets);

	walletRepository.reset();

	await sandbox.app.resolve<StateBuilder>(StateBuilder).run();
	await delay(2000);

	const allByPublicKeyBootstrapped = walletRepository
		.allByPublicKey()
		.map((w) => w.clone())
		.sort(sortWallets)
		.map(mapWallets);
	expect(allByPublicKeyBootstrapped).toEqual(allByPublicKey);

	await sandbox.dispose();
};
