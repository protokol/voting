import { Contracts } from "@arkecosystem/core-api";
import { Container } from "@arkecosystem/core-kernel";

import { ApiErrors } from "../errors";

@Container.injectable()
export class StatisticsResource implements Contracts.Resource {
	public raw(_resource: object): object {
		throw new ApiErrors.RawTypeNotSupportedError();
	}

	public transform(resource): object {
		const agree = resource.voters.agree.length;
		const disagree = resource.voters.disagree.length;
		const allVoters: number = agree + disagree;

		let percentageOfAgree = 0;
		let percentageOfDisagree = 0;
		if (allVoters != 0) {
			percentageOfAgree = (agree / allVoters) * 100;
			percentageOfDisagree = 100 - percentageOfAgree;
		}

		return {
			address: resource.address,
			publicKey: resource.publicKey,
			allVoters: allVoters,
			agreed: {
				amount: agree,
				percentage: percentageOfAgree,
			},
			disagreed: {
				amount: disagree,
				percentage: percentageOfDisagree,
			},
		};
	}
}
