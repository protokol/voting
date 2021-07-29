import { Contracts } from "@arkecosystem/core-api";
import { Container } from "@arkecosystem/core-kernel";
import { Utils } from "@arkecosystem/crypto";

import { ApiErrors } from "../errors";

@Container.injectable()
export class StatisticsResource implements Contracts.Resource {
	public raw(_resource: object): object {
		throw new ApiErrors.RawTypeNotSupportedError();
	}

	public transform(resource): object {
		const { address, publicKey, voters, status } = resource;
		const agree: Utils.BigNumber = voters.agree.reduce(
			(acc: Utils.BigNumber, vote) => acc.plus(vote.balance),
			Utils.BigNumber.ZERO,
		);
		const disagree: Utils.BigNumber = voters.disagree.reduce(
			(acc: Utils.BigNumber, vote) => acc.plus(vote.balance),
			Utils.BigNumber.ZERO,
		);
		const allVoters: Utils.BigNumber = agree.plus(disagree);

		let percentageOfAgree = 0;
		let percentageOfDisagree = 0;
		if (!allVoters.isZero()) {
			const multiplier = 100 * 10 ** 3; // to calculate % using 3 decimal places
			percentageOfAgree = parseInt(agree.times(multiplier).div(allVoters).toFixed()) / (multiplier / 100);
			percentageOfDisagree = 100 - percentageOfAgree;
		}

		return {
			address,
			publicKey,
			status,
			allVoters: allVoters,
			agreed: {
				amount: agree.toFixed(),
				percentage: percentageOfAgree,
			},
			disagreed: {
				amount: disagree.toFixed(),
				percentage: percentageOfDisagree,
			},
		};
	}
}
