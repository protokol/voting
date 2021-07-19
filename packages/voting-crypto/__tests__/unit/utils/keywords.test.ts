import { Validation } from "@arkecosystem/crypto";

import { castVoteOptionValidator } from "../../../src/utils";

let validate;

beforeAll(() => {
	const ajv = Validation.validator.getInstance();
	castVoteOptionValidator("votingSchema");

	const schema = { votingSchema: true };
	validate = ajv.compile(schema);
});

describe("Utils Keywords Tests", () => {
	it("Should Verify Verification Correctly - Option: yes", () => {
		expect(validate("yes")).toBeTruthy();
	});

	it("Should Verify Verification Correctly - Option: no", () => {
		expect(validate("no")).toBeTruthy();
	});

	it("Should Verify Verification Correctly - Random", () => {
		expect(validate("something")).toBeFalsy();
	});
});
