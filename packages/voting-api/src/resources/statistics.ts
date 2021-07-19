import { Contracts } from "@arkecosystem/core-api";
import { Container, Contracts as KernelContracts } from "@arkecosystem/core-kernel";

@Container.injectable()
export class StatisticsResource implements Contracts.Resource {
	// @Container.inject(Container.Identifiers.WalletRepository)
	// @Container.tagged("state", "blockchain")
	// private readonly walletRepository!: KernelContracts.State.WalletRepository;

	public raw(resource): object {
		return JSON.parse(JSON.stringify(resource));
	}

	public transform(resource): object {
		const allVoters: number = resource.voters.agree + resource.voters.disagree;
		let percentageOfAgree: number = (resource.voters.agree / allVoters) * 100;

		let percentageOfDisagree = 0;
		if (allVoters != 0) {
			percentageOfDisagree = 100 - percentageOfAgree;
		}

		return {
			address: resource.address,
			publicKey: resource.publicKey,
			allVoters: allVoters,
			agreed: {
				amount: resource.voters.agree,
				percentage: percentageOfAgree,
			},
			disagreed: {
				amount: resource.voters.disagree,
				percentage: percentageOfDisagree,
			},
		};
	}
}
