import type { ModelCtor } from "%/types/dependent"
import type { Serializable } from "$/types/general"
import type { CommonQueryParameters } from "$/types/query"
import type {
	DepartmentAttributes,
	DepartmentResourceIdentifier
} from "$/types/documents/department"

import User from "%/models/user"
import BaseManager from "%/managers/base"
import trimRight from "$/helpers/trim_right"
import Department from "%/models/department"
import DatabaseError from "$!/errors/database"
import Condition from "%/managers/helpers/condition"
import DepartmentTransformer from "%/transformers/department"

export default class extends BaseManager<Department, DepartmentAttributes, CommonQueryParameters> {
	get model(): ModelCtor<Department> { return Department }

	get transformer(): DepartmentTransformer { return new DepartmentTransformer() }

	async countUsers(departmentIDs: number[]): Promise<Serializable> {
		try {
			if (!Department.sequelize || !User.sequelize) {
				throw new DatabaseError("Developer may have forgot to register the models.")
			}

			const subselectQuery = Department.sequelize.literal(`(${
				trimRight(
					// @ts-ignore
					User.sequelize.getQueryInterface().queryGenerator.selectQuery(
						User.tableName, {
							"attributes": [ User.sequelize.fn("count", "*") ],
							"where": new Condition().equal(
								"departmentID",
								User.sequelize.col(`${Department.tableName}.id`)
							)
							.build()
						}
					),
					";"
				)
			})`)
			const [ counts ] = await Department.sequelize.query(
				// @ts-ignore
				Department.sequelize.getQueryInterface().queryGenerator.selectQuery(
					Department.tableName, {
						"attributes": [ "id", [ subselectQuery, "count" ] ],
						"where": new Condition().or(
							...departmentIDs.map(departmentID => new Condition().equal("id", departmentID))
						)
						.build()
					}
				)
			) as unknown as [ { id: number, count: string }[] ]

			const identifierObjects: DepartmentResourceIdentifier[] = []
			counts.forEach(countInfo => {
				identifierObjects.push({
					"type": "department",
					"id": String(countInfo.id),
					"meta": {
						"userCount": Number(countInfo.count)
					}
				})
			})

			return { "data": identifierObjects }
		} catch (error) {
			throw this.makeBaseError(error)
		}
	}
}
