import { Contracts } from "@arkecosystem/core-api";
import { Container } from "@arkecosystem/core-kernel";

import { ApiErrors } from "../errors";

@Container.injectable()
export class ConfigurationsResource implements Contracts.Resource {
	public raw(_resource: object): object {
		throw new ApiErrors.RawTypeNotSupportedError();
	}

	public transform(resource): object {
		return {
			api: {
				packageName: resource.apiPackageName,
				currentVersion: resource.currentVersion,
				latestVersion: resource.apiLatestVersion,
			},
			transactions: {
				packageName: "@protokol/voting-transactions",
				currentVersion: resource.currentVersion,
				latestVersion: resource.transactionsLatestVersion,
			},
			crypto: {
				packageName: "@protokol/voting-crypto",
				currentVersion: resource.currentVersion,
				latestVersion: resource.cryptoLatestVersion,
			},
		};
	}
}
