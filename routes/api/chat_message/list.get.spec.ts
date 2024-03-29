import ErrorBag from "$!/errors/error_bag"
import UserFactory from "~/factories/user"
import Factory from "~/factories/chat_message"
import MockRequester from "~/setups/mock_requester"
import ConsultationFactory from "~/factories/consultation"
import ChatMessageActivityFactory from "~/factories/chat_message_activity"

import Controller from "./list.get"

const QUERY_VALIDATION_INDEX = 0

describe("Controller: GET /api/chat_message", () => {
	const requester = new MockRequester()

	it("can accept valid info", async() => {
		const controller = new Controller()
		const { validations } = controller
		const queryValidation = validations[QUERY_VALIDATION_INDEX]
		const queryValidationFunction = queryValidation.intermediate.bind(queryValidation)
		const userFactory = new UserFactory()
		const user = await userFactory.insertOne()
		const consultation = await new ConsultationFactory().insertOne()
		const activity = await new ChatMessageActivityFactory()
		.consultation(() => Promise.resolve(consultation))
		.user(() => Promise.resolve(user))
		.insertOne()
		await new Factory()
		.chatMessageActivity(() => Promise.resolve(activity))
		.insertOne()
		requester.customizeRequest({
			"query": {
				"filter": {
					"consultationIDs": String(consultation.id),
					"existence": "*"
				}
			},
			"user": await userFactory.serialize(user)
		})

		await requester.runMiddleware(queryValidationFunction)

		requester.expectSuccess()
	})

	it("can accept valid info with multiple consultation ID", async() => {
		const controller = new Controller()
		const { validations } = controller
		const queryValidation = validations[QUERY_VALIDATION_INDEX]
		const queryValidationFunction = queryValidation.intermediate.bind(queryValidation)
		const userFactory = new UserFactory()
		const user = await userFactory.insertOne()
		const consultations = await new ConsultationFactory().insertMany(2)
		const consultationIterator = consultations.values()
		const activities = await new ChatMessageActivityFactory()
		.user(() => Promise.resolve(user))
		.consultation(() => Promise.resolve(consultationIterator.next().value))
		.insertMany(consultations.length)
		const activitiesIterator = activities.values()
		await new Factory()
		.chatMessageActivity(() => Promise.resolve(activitiesIterator.next().value))
		.insertOne()
		requester.customizeRequest({
			"query": {
				"filter": {
					"consultationIDs": consultations.map(consultation => consultation.id).join(","),
					"existence": "*"
				}
			},
			"user": await userFactory.serialize(user)
		})

		await requester.runMiddleware(queryValidationFunction)

		requester.expectSuccess()
	})

	it("cannot accept invalid info", async() => {
		const controller = new Controller()
		const { validations } = controller
		const queryValidation = validations[QUERY_VALIDATION_INDEX]
		const queryValidationFunction = queryValidation.intermediate.bind(queryValidation)
		const userFactory = new UserFactory()
		const user = await userFactory.insertOne()
		requester.customizeRequest({
			"query": {
				"filter": {
					"existence": "hello"
				}
			},
			"user": await userFactory.serialize(user)
		})

		await requester.runMiddleware(queryValidationFunction)

		const body = requester.expectFailure(ErrorBag).toJSON()
		expect(body).toHaveLength(2)
		expect(body).toHaveProperty("0.source.parameter", "filter.consultationIDs")
		expect(body).toHaveProperty("1.source.parameter", "filter.existence")
	})
})
