import { Contracts } from "@arkecosystem/core-api";
import { Container, Contracts as KernelContracts } from "@arkecosystem/core-kernel";

@Container.injectable()
export class WalletResource implements Contracts.Resource {
	public raw(resource): object {
		return JSON.parse(JSON.stringify(resource));
	}

	public transform(resource: KernelContracts.State.Wallet): object {
		const proposals = resource.getAttribute("voting.proposal");
		return {
			address: resource.getAddress(),
			senderPublicKey: resource.getPublicKey(),
			nonce: resource.getNonce(),
			balance: resource.getBalance().toFixed(),
			proposals,
		};
	}
}
