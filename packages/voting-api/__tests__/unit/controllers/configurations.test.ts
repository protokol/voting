import { Application } from "@arkecosystem/core-kernel";

import { ConfigurationsController } from "../../../src/controllers/configurations";
import { initApp, ItemResponse } from "../__support__";

let app: Application;

let configurationsController: ConfigurationsController;

beforeAll(() => {
	app = initApp();

	configurationsController = app.resolve<ConfigurationsController>(ConfigurationsController);
});
describe("Configurations Controller", () => {
	let response;
	beforeEach(async () => {
		response = (await configurationsController.index()) as ItemResponse;
	});

	describe("Should Test Configurations Controller Return", () => {
		it("Should Return Correct Response", () => {
			expect(response.data.api).toBeObject();
			expect(response.data.transactions).toBeObject();
			expect(response.data.crypto).toBeObject();
		});
	});
});
