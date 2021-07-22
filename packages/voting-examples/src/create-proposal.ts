import { Identities, Managers, Transactions, Utils } from "@arkecosystem/crypto";
import { ProtokolConnection } from "@protokol/client";
import { Builders, Transactions as VotingTransactions } from "@protokol/voting-crypto";

export const CreateProposal = async (): Promise<void> => {
	// Configure our API client
	const client = new ProtokolConnection("http://localhost:4003/api");
	const passphrase = "clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire";

	// Configure manager and register transaction type
	const configs = await client.api("node").crypto();
	const {
		body: {
			data: {
				block: { height },
			},
		},
	} = await client.get("blockchain");

	Managers.configManager.setConfig({
		network: configs.body.data.network,
		milestones: configs.body.data.milestones,
		genesisBlock: Managers.configManager.getPreset("devnet").genesisBlock,
		exceptions: configs.body.data.exceptions,
	});
	Managers.configManager.setHeight(height);
	Transactions.TransactionRegistry.registerTransactionType(VotingTransactions.CreateProposalTransaction);

	// Step 1: Retrieve the nonce of the sender wallet
	const senderWallet = await client.api("wallets").get(Identities.Address.fromPassphrase(passphrase));
	const senderNonce = Utils.BigNumber.make(senderWallet.body.data.nonce).plus(1);

	// Step 2: Create the transaction
	const transaction = new Builders.CreateProposalBuilder()
		.createProposal({
			duration: {
				blockHeight: 123456,
			},
			content: "qwertz",
		})
		.nonce(senderNonce.toFixed())
		.sign(passphrase);

	// Step 3: Broadcast the transaction
	const broadcastResponse = await client.api("transactions").create({ transactions: [transaction.build().toJson()] });

	// Step 4: Log the response
	console.log(broadcastResponse.body);
};

void CreateProposal();
