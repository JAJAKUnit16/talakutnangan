import ErrorBag from "$!/errors/error_bag"
import Factory from "~/factories/chat_message"
import MockRequester from "~/set-ups/mock_requester"

import Controller from "./update(id).patch"

const BODY_VALIDATION_INDEX = 1

describe("Controller: PATCH /api/chat_message/:id", () => {
	const requester = new MockRequester()

	it("can accept valid info", async() => {
		const controller = new Controller()
		const { validations } = controller
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const model = await new Factory().insertOne()
		const newModel = await new Factory().makeOne()
		requester.customizeRequest({
			"body": {
				"data": {
					"attributes": {
						"data": newModel.data,
						"kind": newModel.kind
					},
					"id": String(model.id),
					"type": "chat_message"
				}
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		requester.expectSuccess()
	})

	it("cannot accept invalid data", async() => {
		const controller = new Controller()
		const { validations } = controller
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const model = await new Factory().insertOne()
		const newModel = await new Factory().makeOne()
		requester.customizeRequest({
			"body": {
				"data": {
					"attributes": {
						"data": "not an object",
						"kind": newModel.kind
					},
					"id": String(model.id),
					"type": "chat_message"
				}
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		const body = requester.expectFailure(ErrorBag).toJSON()
		expect(body).toHaveLength(1)
		expect(body).toHaveProperty("0.source.pointer", "data.attributes.data")
	})
})
