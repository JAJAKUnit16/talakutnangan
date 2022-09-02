import { shallowMount } from "@vue/test-utils"

import "~/set-ups/database.set_up"
import UserFactory from "~/factories/user"
import Factory from "~/factories/consultation"
import ChatMessageFactory from "~/factories/chat_message"
import ChatMessageActivity from "%/models/chat_message_activity"
import UserProfileTransformer from "%/transformers/user_profile"
import ChatMessageActivityFactory from "~/factories/chat_message_activity"

import Page from "./read.page.vue"

describe("UI Page: Read resource by ID", () => {
	it("should load resource by ID", async() => {
		const userFactory = new UserFactory()
		const userModel = await userFactory.insertOne()
		const factory = new Factory()
		const models = await factory.insertMany(3)
		const model = await factory.insertOne()
		const allModels = [ model, ...models ]
		const allModelIterator = allModels.values()
		const chatMessageActivityFactory = new ChatMessageActivityFactory()
		const chatMessageActivityModels = await chatMessageActivityFactory
		.consultation(() => Promise.resolve(allModelIterator.next().value))
		.insertMany(allModels.length)
		const chatMessageActivityModelIterator = chatMessageActivityModels.values()
		const chatMessageFactory = new ChatMessageFactory()
		const previewMessageModels = await chatMessageFactory
		.chatMessageActivity(() => Promise.resolve(chatMessageActivityModelIterator.next().value))
		.insertMany(chatMessageActivityModels.length)
		const activityOfModel = chatMessageActivityModels.find(
			chatMessageActivityModel => chatMessageActivityModel.consultationID == model.id
		) as ChatMessageActivity
		const chatMessageModels = await chatMessageFactory
		.chatMessageActivity(() => Promise.resolve(activityOfModel))
		.insertMany(5)

		const userResource = userFactory.deserialize(
			userModel,
			{} as unknown as void,
			new UserProfileTransformer()
		)
		const resource = factory.deserialize(model)
		const resources = factory.deserialize(models)
		const chatMessageActivityResources = chatMessageActivityFactory
			.deserialize(chatMessageActivityModels)
		const previewMessageResources = chatMessageFactory.deserialize(previewMessageModels)
		const chatMessageResources = chatMessageFactory.deserialize(chatMessageModels)
		const wrapper = shallowMount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							"userProfile": userResource,

							"consultation": resource,
							"chatMessages": chatMessageResources,

							"consultations": resources,
							"chatMessageActivities": chatMessageActivityResources,
							"previewMessages": previewMessageResources
						}
					}
				},
				"stubs": {
					"ConsultationShell": false
				}
			}
		})

		const consultationList = wrapper.findComponent({ "name": "ConsultationList" })
		const chatWindow = wrapper.findComponent({ "name": "ChatWindow" })

		expect(consultationList.exists()).toBeTruthy()
		expect(chatWindow.exists()).toBeTruthy()
	})
})
