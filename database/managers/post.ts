import type { Pipe } from "$/types/database"
import type { Serializable } from "$/types/general"
import type { PostQueryParameters } from "$/types/query"
import type { Model as BaseModel, ModelCtor, FindAndCountOptions } from "%/types/dependent"
import type { PostAttributes, PostResource, PostResourceIdentifier } from "$/types/documents/post"

import Log from "$!/singletons/log"
import trimRight from "$/string/trim_right"
import DatabaseError from "$!/errors/database"

import User from "%/models/user"
import Model from "%/models/post"
import Comment from "%/models/comment"
import PostTag from "%/models/post_tag"
import AttachedRole from "%/models/attached_role"
import PostAttachment from "%/models/post_attachment"

import BaseManager from "%/managers/base"
import Condition from "%/helpers/condition"
import Transformer from "%/transformers/post"
import AttachedRoleManager from "%/managers/attached_role"

import siftByTags from "%/queries/post/sift_by_tags"
import siftByRange from "%/queries/post/sift_by_range"
import includeDefaults from "%/queries/post/include_defaults"
import siftByDepartment from "%/queries/post/sift_by_department"

export default class extends BaseManager<
	Model,
	PostAttributes<"deserialized">,
	PostQueryParameters<number>
> {
	get model(): ModelCtor<Model> { return Model }

	get transformer(): Transformer { return new Transformer() }

	get exposableColumns(): string[] {
		const excludedColumns = [ "approvedAt", "attachedRoleID", "departmentID", "deletedAt" ]
		return super.exposableColumns.filter(columnName => {
			const isIncluded = !excludedColumns.includes(columnName)
			return isIncluded
		})
	}

	get singleReadPipeline(): Pipe<
		FindAndCountOptions<Model>,
		PostQueryParameters<number>
	>[] {
		return [
			includeDefaults,
			...super.singleReadPipeline
		]
	}

	get listPipeline(): Pipe<
		FindAndCountOptions<Model>,
		PostQueryParameters<number>
	>[] {
		return [
			siftByRange,
			siftByDepartment,
			siftByTags,
			includeDefaults,
			...super.listPipeline
		]
	}

	get modelChainToUser(): readonly ModelCtor<BaseModel>[] {
		return [
			AttachedRole,
			User
		]
	}

	async createUsingResource(
		details: PostResource<"create">,
		transformerOptions: void = {} as unknown as void
	): Promise<Serializable> {
		try {
			const { attributes, relationships } = details

			const {
				"poster": {
					"data": {
						"id": userID
					}
				},
				"posterRole": {
					"data": {
						"id": roleID
					}
				},
				"postAttachments": attachments,
				department,
				tags
			} = relationships

			const departmentID = department
				? department.data.id
				: null

			const attachedRoleManager = new AttachedRoleManager({
				"cache": this.cache,
				"transaction": this.transaction
			})
			const attachedRole = await attachedRoleManager.findAttachedRole(
				Number(userID),
				Number(roleID)
			)

			if (attachedRole === null) {
				throw new DatabaseError("Comment has incorrect role.")
			}

			const model = await this.model.create(
				{
					...attributes,
					"attachedRoleID": attachedRole.id,
					departmentID
				},
				this.transaction.transactionObject
			)

			model.posterInfo = attachedRole

			if (attachments && attachments.data.length > 0) {
				const IDMatcher = new Condition().isIncludedIn(
					"id",
					attachments.data.map(attachment => attachment.id)
				).build()
				await PostAttachment.update({
					"postID": model.id
				}, {
					"where": IDMatcher,
					...this.transaction.transactionObject
				})
			}

			if (tags && tags.data.length > 0) {
				const tagData = tags.data.map(tag => ({
					"postID": model.id,
					"tagID": tag.id
				}))
				await PostTag.bulkCreate(tagData, {
					...this.transaction.transactionObject
				})
			}

			Log.success("manager", "done creating a model")

			return await this.serialize(model, transformerOptions, this.transformer)
		} catch (error) {
			throw this.makeBaseError(error)
		}
	}

	async countComments(postIDs: number[]): Promise<Serializable> {
		try {
			if (!Model.sequelize || !Comment.sequelize) {
				throw new DatabaseError("Developer may have forgot to register the models.")
			}

			const subselectQuery = Model.sequelize.literal(`(${
				trimRight(
					// @ts-ignore
					Comment.sequelize.getQueryInterface().queryGenerator.selectQuery(
						Comment.tableName, {
							"attributes": [ Comment.sequelize.fn("count", "*") ],
							"where": new Condition().equal(
								"postID",
								Comment.sequelize.col(`${Model.tableName}.id`)
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
							...postIDs.map(postID => new Condition().equal("id", postID))
						)
						.build()
					}
				)
			) as unknown as [ { id: number, count: string }[] ]

			const identifierObjects: PostResourceIdentifier[] = []
			counts.forEach(countInfo => {
				identifierObjects.push({
					"id": String(countInfo.id),
					"meta": {
						"commentCount": Number(countInfo.count)
					},
					"type": "post"
				})
			})

			return { "data": identifierObjects }
		} catch (error) {
			throw this.makeBaseError(error)
		}
	}
}
