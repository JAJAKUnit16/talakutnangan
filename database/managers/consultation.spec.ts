import type { ConsultationResource } from "$/types/documents/consultation"

import Model from "%/models/consultation"
import UserFactory from "~/factories/user"
import Factory from "~/factories/consultation"
import AttachedRoleFactory from "~/factories/attached_role"
import ChatMessageActivity from "%/models/chat_message_activity"

import type { UserIdentifierDocument } from "$/types/documents/user"
import Manager from "./consultation"

describe("Database Manager: Consultation create operations", () => {
	it("can create resource", async() => {
		const attachedRole = await new AttachedRoleFactory().insertOne()
		const user = await new UserFactory().insertOne()
		const model = await new Factory()
		.consultantInfo(() => Promise.resolve(attachedRole))
		.consulters(() => Promise.resolve([ user ]))
		.makeOne()
		const resource: ConsultationResource<"create"> = {
			"attributes": {
				"actionTaken": model.actionTaken,
				"finishedAt": null,
				"reason": model.reason,
				"scheduledStartAt": new Date().toISOString(),
				"startedAt": null
			},
			// eslint-disable-next-line no-undefined
			"id": undefined,
			"relationships": {
				// eslint-disable-next-line no-undefined
				"chatMessageActivities": undefined,
				// eslint-disable-next-line no-undefined
				"chatMessages": undefined,
				"consultant": {
					"data": {
						"id": String(attachedRole.userID),
						"type": "user"
					}
				} as UserIdentifierDocument,
				"consultantRole": {
					"data": {
						"id": String(attachedRole.roleID),
						"type": "role"
					}
				},
				"consulters": {
					"data": [
						{
							"id": String(user.id),
							"type": "user"
						}
					]
				}
			},
			"type": "consultation"
		}
		const manager = new Manager()

		const createdData = await manager.createUsingResource(resource)

		expect(await Model.count()).toBe(1)
		expect(await ChatMessageActivity.count()).toBe(2)
		expect(createdData).toHaveProperty("data.attributes.actionTaken", model.actionTaken)
		expect(createdData).toHaveProperty("data.attributes.reason", model.reason)
		expect(createdData).toHaveProperty("data.relationships.consultant")
		expect(createdData).toHaveProperty("data.relationships.consultantRole")
		expect(createdData).toHaveProperty("data.relationships.chatMessageActivities")
	})
})

describe("Database Manager: Miscellaneous chat message operations", () => {
	it("can get sortable columns", () => {
		// Include in test to alert in case there are new columns to decide whether to expose or not
		const manager = new Manager()

		const { sortableColumns } = manager

		expect(sortableColumns).toStrictEqual([
			"-actionTaken",
			"-createdAt",
			"-deletedAt",
			"-finishedAt",
			"-reason",
			"-scheduledStartAt",
			"-startedAt",
			"-updatedAt",
			"actionTaken",
			"createdAt",
			"deletedAt",
			"finishedAt",
			"reason",
			"scheduledStartAt",
			"startedAt",
			"updatedAt"
		])
	})
})
