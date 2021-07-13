export interface ICreateProposal {
	duration: {
		blockHeight: number;
	};
	content: string;
}

export interface ICastVote {
	proposalId: string;
	decision: string;
}
