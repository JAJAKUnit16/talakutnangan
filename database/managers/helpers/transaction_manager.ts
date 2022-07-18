import { Transaction } from "sequelize"

import Database from "%/data_source/database"

/**
 * Manages the transaction to be implementation-agnostic
 */
export default class {
	private transaction: Transaction|null = null

	async initialize() {
		if (this.transaction === null) {
			// For informred decision, please read:
			// https://medium.com/nerd-for-tech/understanding-database-isolation-levels-c4ebcd55c6b9
			this.transaction = await Database.dataSource.transaction({
				isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
			})
		}
	}

	async destroySuccessfully() {
		if (this.transaction !== null) {
			await this.transaction.commit()
			this.transaction = null
		}
	}

	async destroyIneffectually() {
		if (this.transaction !== null) {
			await this.transaction.rollback()
			this.transaction = null
		}
	}
}
