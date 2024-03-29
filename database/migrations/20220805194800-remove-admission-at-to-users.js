
module.exports = {
	async up(queryInterface, unusedSequelize) {
		await queryInterface.sequelize.transaction(async transaction => {
			try {
				await queryInterface.removeColumn("Users", "admittedAt", { transaction })
			} catch (err) {
				await transaction.rollback()
				throw err
			}
		})
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.sequelize.transaction(async transaction => {
			try {
				await queryInterface.addColumn(
					"Users",
					"admittedAt",
					{
						"allowNull": true,
						"defaultValue": null,
						"type": Sequelize.DATE
					},
					{ transaction }
				)
			} catch (err) {
				await transaction.rollback()
				throw err
			}
		})
	}
}
