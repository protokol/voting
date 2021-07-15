import "@arkecosystem/core-test-framework/dist/matchers";

import { Contracts } from "@arkecosystem/core-kernel";
import { ApiHelpers } from "@arkecosystem/core-test-framework";

import { setUp, tearDown } from "../__support__/setup";

let app: Contracts.Kernel.Application;
let api: ApiHelpers;

beforeAll(async () => {
	app = await setUp();
	api = new ApiHelpers(app);
});

afterAll(async () => await tearDown());

describe("API - Configurations", () => {
	describe("GET - /voting/configurations", () => {
		describe("Should Test Configurations Response", () => {
			let response: any;
			beforeAll(async () => {
				response = await api.request("GET", "voting/configurations");
			});

			it("Should Test If Response Is Successful", async () => {
				expect(response).toBeSuccessfulResponse();
			});
		});
	});
});
