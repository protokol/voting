import { Controller } from "@arkecosystem/core-api";
import { Container } from "@arkecosystem/core-kernel";
import { Defaults as CryptoDefaults } from "@protokol/voting-crypto";
import { Defaults as TransactionDefaults } from "@protokol/voting-transactions";
import latestVersion from "latest-version";

import { defaults as ApiDefaults } from "../defaults";
import { ConfigurationsResource } from "../resources/configurations";

const packageName = require("../../package.json").name;
const currentVersion = require("../../package.json").version;

@Container.injectable()
export class ConfigurationController extends Controller {
	public async index(): Promise<any> {
		let apiLatestVersion: string;
		let cryptoLatestVersion: string;
		let transactionsLatestVersion: string;

		try {
			apiLatestVersion = await latestVersion(packageName);
		} catch {
			apiLatestVersion = "Not Published";
		}

		try {
			cryptoLatestVersion = await latestVersion("@package/voting-crypto");
		} catch {
			cryptoLatestVersion = "Not Published";
		}

		try {
			transactionsLatestVersion = await latestVersion("@package/voting-transactions");
		} catch {
			transactionsLatestVersion = "Not Published";
		}

		return this.respondWithResource(
			{
				apiPackageName: packageName,
				apiLatestVersion,
				cryptoLatestVersion,
				transactionsLatestVersion,
				currentVersion: currentVersion,
				transactionsDefaults: TransactionDefaults,
				cryptoDefaults: CryptoDefaults,
				apiDefaults: ApiDefaults,
			},
			ConfigurationsResource,
		);
	}
}
