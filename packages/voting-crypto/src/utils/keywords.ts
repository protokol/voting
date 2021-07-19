import { Validation } from "@arkecosystem/crypto";

import { VotingOptions } from "../enums";

export const castVoteOptionValidator = (keyword: string): void => {
	Validation.validator.removeKeyword(keyword);
	Validation.validator.addKeyword(keyword, {
		compile: () => (data) => data === VotingOptions.Agree || data === VotingOptions.Disagree,
		errors: true,
		metaSchema: {
			type: "boolean",
		},
	});
};
