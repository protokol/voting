import { Contracts } from "@arkecosystem/core-api";
import { Container } from "@arkecosystem/core-kernel";

import { ApiErrors } from "../errors";

@Container.injectable()
export class StatisticsResource implements Contracts.Resource {
	public raw(_resource: object): object {
		throw new ApiErrors.RawTypeNotSupportedError();
	}

	public transform(resource): object {
		const allVoters: number = resource.voters.agree + resource.voters.disagree;
		const percentageOfAgree: number = (resource.voters.agree / allVoters) * 100;

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
