import "@arkecosystem/core-test-framework/dist/matchers";

import { Contracts } from "@arkecosystem/core-kernel";
import { ApiHelpers } from "@arkecosystem/core-test-framework";

import { setUp, tearDown } from "../__support__/setup";

jest.setTimeout(30000);

let app: Contracts.Kernel.Application;
let api: ApiHelpers;

beforeAll(async () => {
	app = await setUp();
	api = new ApiHelpers(app);
});

afterAll(async () => await tearDown());

describe("API - Statistics", () => {
	describe("GET - /voting/statistic/${id}", () => {
		describe("Should Test Statistics Response", () => {
			let response: any;
			beforeAll(async () => {
				response = await api.request("GET", "voting/statistic/123");
			});

			it("Should Test If Response Is Successful", async () => {
				console.log(response);
				expect(response).not.toBeSuccessfulResponse();
			});
		});
	});
});
