import { Utils } from "@arkecosystem/crypto";
import { FindOperator } from "typeorm";

import { WalletBalance } from "../../interfaces";

export const transformWalletBalance = {
	from(value: WalletBalance[] | undefined): WalletBalance[] {
		if (value !== undefined && value !== null) {
			return value.map((x) => ({ publicKey: x.publicKey, balance: new Utils.BigNumber(x.balance) }));
		}

		return [];
	},
	to(value: WalletBalance[] | FindOperator<any>): WalletBalance[] {
		if (value !== undefined && value !== null) {
			return value instanceof FindOperator ? value.value : value;
		}

		return [];
	},
};
