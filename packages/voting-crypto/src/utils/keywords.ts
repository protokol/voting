import { Validation } from "@arkecosystem/crypto";

export const castVoteOptionValidator = (keyword: string): void => {
	Validation.validator.removeKeyword(keyword);
	Validation.validator.addKeyword(keyword, {
		compile: () => (data) => data === "yes" || data === "no",
		errors: true,
		metaSchema: {
			type: "boolean",
		},
	});
};
