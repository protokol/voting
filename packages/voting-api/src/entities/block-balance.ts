import { Column, Entity, PrimaryColumn } from "typeorm";

import { WalletBalance } from "../interfaces";
import { transformWalletBalance } from "./utils";

@Entity({
	name: "block_balances",
})
export class BlockBalance {
	@PrimaryColumn({
		type: "varchar",
		length: 64,
	})
	public id!: string;

	@Column({
		type: "varchar",
		length: 64,
	})
	public blockId!: string;

	@Column({ type: "simple-json", transformer: transformWalletBalance })
	public agree!: WalletBalance[];

	@Column({ type: "simple-json", transformer: transformWalletBalance })
	public disagree!: WalletBalance[];

	constructor(id: string, blockId: string, agree: WalletBalance[], disagree: WalletBalance[]) {
		this.id = id;
		this.blockId = blockId;
		this.agree = agree;
		this.disagree = disagree;
	}
}
