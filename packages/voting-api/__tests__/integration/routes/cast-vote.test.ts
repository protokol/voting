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

describe("API - Cast Vote", () => {
	describe("GET - /cast/vote/transactions", () => {
		describe("Should Test Response", () => {
			let response: any;
			beforeAll(async () => {
				response = await api.request("GET", "voting/cast/vote/transactions");
			});

			it("Should Test If Response Is Successful", async () => {
				expect(response).toBeSuccessfulResponse();
			});
		});
	});

	describe("GET - /cast/vote/transactions/${trxId}", () => {
		describe("Should Test Response", () => {
			let response: any;
			beforeAll(async () => {
				response = await api.request("GET", "voting/cast/vote/transactions/123");
			});

			it("Should Test If Response Is Not Successful", async () => {
				expect(response).not.toBeSuccessfulResponse();
			});
		});
	});

	describe("GET - /cast/vote/${trxId}/wallet", () => {
		describe("Should Test Response", () => {
			let response: any;
			beforeAll(async () => {
				response = await api.request("GET", "voting/cast/vote/123/wallet");
			});

			it("Should Test If Response Is Not Successful", async () => {
				expect(response).not.toBeSuccessfulResponse();
			});
		});
	});
});
