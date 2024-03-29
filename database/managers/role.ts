import type { Pipe } from "$/types/database"
import type { Serializable } from "$/types/general"
import type { RoleQueryParameters } from "$/types/query"
import type { RoleAttributes, RoleResourceIdentifier } from "$/types/documents/role"
import type { Model as BaseModel, ModelCtor, FindAndCountOptions } from "%/types/dependent"

import User from "%/models/user"
import Model from "%/models/role"
import BaseManager from "%/managers/base"
import DatabaseError from "$!/errors/database"
import AttachedRole from "%/models/attached_role"
import RoleTransformer from "%/transformers/role"

import Condition from "%/helpers/condition"
import makeUnique from "$/array/make_unique"
import segregateIDsExistentially from "%/helpers/segregate_IDs_existentially"

import siftBySlug from "%/queries/role/sift_by_slug"
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
			siftBySlug,
			siftByDepartment,
			...super.listPipeline
		]
	}

	get modelChainToUser(): readonly ModelCtor<BaseModel>[] {
		throw new DatabaseError("Roles are not owned by any user. They are being attached.")
	}

	async countUsers(roleIDs: number[]): Promise<Serializable> {
		try {
			const models = await Model.findAll({
				"include": [
					{
						"model": User,
						"required": false
					}
				],
				"where": new Condition().isIncludedIn("id", roleIDs).build(),
				...this.transaction.transactionObject
			})

			const identifierObjects: RoleResourceIdentifier<"read">[] = []
			models.forEach(model => {
				identifierObjects.push({
					"id": String(model.id),
					"meta": {
						"userCount": Number(model.users.length)
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
		try {
			const attachedRoles = await AttachedRole.findAll({
				"paranoid": false,
				"where": new Condition().equal("userID", userID).build(),
				...this.transaction.transactionObject
			})

			const currentAttachedRoleIDs = attachedRoles.filter(
				attachedRole => !attachedRole.deletedAt
			).map(
				attachedRole => Number(attachedRole.roleID)
			)
			const previousAttachedRoleIDs = attachedRoles.filter(
				attachedRole => Boolean(attachedRole.deletedAt)
			).map(
				attachedRole => Number(attachedRole.roleID)
			)
			const { newIDs, restoredIDs, deletedIDs } = segregateIDsExistentially(
				currentAttachedRoleIDs,
				previousAttachedRoleIDs,
				roleIDs
			)

			if (newIDs.length > 0) {
				await AttachedRole.bulkCreate(
					newIDs.map(roleID => ({
						roleID,
						userID
					})),
					{
						...this.transaction.transactionObject
					}
				)
			}

			if (deletedIDs.length > 0) {
				const deleteCondition = new Condition().and(
					new Condition().equal("userID", userID),
					new Condition().isIncludedIn("roleID", deletedIDs)
				)
				await AttachedRole.destroy({
					"where": deleteCondition.build(),
					...this.transaction.transactionObject
				})
			}

			if (restoredIDs.length > 0) {
				const restoreCondition = new Condition().and(
					new Condition().equal("userID", userID),
					new Condition().isIncludedIn("roleID", restoredIDs)
				)
				await AttachedRole.restore({
					"where": restoreCondition.build(),
					...this.transaction.transactionObject
				})
			}
		} catch (error) {
			throw this.makeBaseError(error)
		}
	}

	async isTheOnlyRoleToAnyUser(roleID: number): Promise<boolean> {
		try {
			if (!Model.sequelize || !AttachedRole.sequelize) {
				throw new DatabaseError("Developer may have forgot to register the models.")
			}

			const [ rawUserIDs ] = await AttachedRole.sequelize.query(
				// @ts-ignore
				AttachedRole.sequelize.getQueryInterface().queryGenerator.selectQuery(
					AttachedRole.tableName, {
						"attributes": [
							"userID",
							"roleID"
						],
						"where": new Condition().equal("roleID", roleID).build()
					}
				)
			) as unknown as [ { id: number, userID: string }[] ]
			const userIDs = rawUserIDs.map(info => info.userID)

			const [ counts ] = await Model.sequelize.query(
				// @ts-ignore
				AttachedRole.sequelize.getQueryInterface().queryGenerator.selectQuery(
					AttachedRole.tableName, {
						"attributes": [
							"userID",
							[
								AttachedRole.sequelize.fn(
									"count", "roleID"
								),
								"roleIDCount"
							]
						],
						"group": [
							[ "userID" ]
						],
						"having": new Condition().equal("roleIDCount", 1).build(),
						"where": new Condition().isIncludedIn("userID", userIDs).build()
					}
				)
			) as unknown as [ { id: number, count: string }[] ]

			return counts.length > 0
		} catch (error) {
			throw this.makeBaseError(error)
		}
	}

	async canRolesBeDeLeted(roleIDs: number[]): Promise<boolean> {
		try {
			if (!Model.sequelize || !AttachedRole.sequelize) {
				throw new DatabaseError("Developer may have forgot to register the models.")
			}

			const [ rawUserIDs ] = await AttachedRole.sequelize.query(
				// @ts-ignore
				AttachedRole.sequelize.getQueryInterface().queryGenerator.selectQuery(
					AttachedRole.tableName, {
						"attributes": [
							"userID",
							"roleID"
						],
						"where": new Condition().or(
							...roleIDs.map(roleID => new Condition().equal("roleID", roleID))
						).build()
					}
				)
			) as unknown as [ { id: number, userID: string }[] ]
			const userIDs = makeUnique(rawUserIDs.map(info => info.userID))

			const [ survivingAttachments ] = await Model.sequelize.query(
				// @ts-ignore
				AttachedRole.sequelize.getQueryInterface().queryGenerator.selectQuery(
					AttachedRole.tableName, {
						"attributes": [
							"userID"
						],
						"group": [
							[ "userID" ]
						],
						"where": new Condition().and(
							new Condition().isIncludedIn("userID", userIDs),
							new Condition().isNotIncludedIn("roleID", roleIDs)
						).build()
					}
				)
			) as unknown as [ { id: number, userID: string }[] ]
			const survivingUserIDs = survivingAttachments.map(info => info.userID)

			return userIDs.length === survivingUserIDs.length
		} catch (error) {
			throw this.makeBaseError(error)
		}
	}
}
