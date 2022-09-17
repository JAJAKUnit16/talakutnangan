import type { Pipe } from "$/types/database"
import type { Serializable } from "$/types/general"
import type { RoleQueryParameters } from "$/types/query"
import type { Model as BaseModel, ModelCtor, FindAndCountOptions } from "%/types/dependent"
import type { RoleAttributes, RoleResourceIdentifier } from "$/types/documents/role"

import Model from "%/models/role"
import BaseManager from "%/helpers/base"
import trimRight from "$/string/trim_right"
import DatabaseError from "$!/errors/database"
import AttachedRole from "%/models/attached_role"
import RoleTransformer from "%/transformers/role"
import Condition from "%/helpers/helpers/condition"
import segragateIDs from "%/helpers/helpers/segragate_IDs"
import siftByDepartment from "%/queries/role/sift_by_department"

export default class extends BaseManager<
	Model,
	RoleAttributes<"deserialized">,
	RoleQueryParameters<number>
> {
	get model(): ModelCtor<Model> { return Model }

	get transformer(): RoleTransformer { return new RoleTransformer() }

	get listPipeline(): Pipe<FindAndCountOptions<Model>, RoleQueryParameters<number>>[] {
		return [
			siftByDepartment,
			...super.listPipeline
		]
	}

	get modelChainToUser(): readonly ModelCtor<BaseModel>[] {
		throw new DatabaseError("Roles are not owned by any user. They are being attached.")
	}

	async countUsers(roleIDs: number[]): Promise<Serializable> {
		try {
			if (!Model.sequelize || !AttachedRole.sequelize) {
				throw new DatabaseError("Developer may have forgot to register the models.")
			}

			const subselectQuery = Model.sequelize.literal(`(${
				trimRight(
					// @ts-ignore
					AttachedRole.sequelize.getQueryInterface().queryGenerator.selectQuery(
						AttachedRole.tableName, {
							"attributes": [ AttachedRole.sequelize.fn("count", "*") ],
							"where": new Condition().equal(
								"roleID",
								AttachedRole.sequelize.col(`${Model.tableName}.id`)
							)
							.build()
						}
					),
					";"
				)
			})`)
			const [ counts ] = await Model.sequelize.query(
				// @ts-ignore
				Model.sequelize.getQueryInterface().queryGenerator.selectQuery(
					Model.tableName, {
						"attributes": [ "id", [ subselectQuery, "count" ] ],
						"where": new Condition().or(
							...roleIDs.map(roleID => new Condition().equal("id", roleID))
						)
						.build()
					}
				)
			) as unknown as [ { id: number, count: string }[] ]

			const identifierObjects: RoleResourceIdentifier<"read">[] = []
			counts.forEach(countInfo => {
				identifierObjects.push({
					"id": String(countInfo.id),
					"meta": {
						"userCount": Number(countInfo.count)
					},
					"type": "role"
				})
			})

			return { "data": identifierObjects }
		} catch (error) {
			throw this.makeBaseError(error)
		}
	}

	async reattach(userID: number, roleIDs: number[]): Promise<void> {
		const attachedRoles = await AttachedRole.findAll({
			"where": new Condition().equal("userID", userID).build()
		})

		const currentAttachedRoleIDs = attachedRoles.map(attachedRole => attachedRole.roleID)
		const { newIDs, deletedIDs } = segragateIDs(currentAttachedRoleIDs, roleIDs)

		if (newIDs.length > 0) {
			await AttachedRole.bulkCreate(
				newIDs.map(roleID => ({
					roleID,
					userID
				}))
			)
		}

		if (deletedIDs.length > 0) {
			const conditionedDeletedIDs: Condition[] = deletedIDs.map(
				id => new Condition().equal("roleID", id)
			)
			const deleteCondition = new Condition().and(
				new Condition().equal("userID", userID),
				new Condition().or(...conditionedDeletedIDs)
			)
			await AttachedRole.destroy({
				"force": true,
				"where": deleteCondition.build()
			})
		}
	}
}
