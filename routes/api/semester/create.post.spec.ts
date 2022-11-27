import ErrorBag from "$!/errors/error_bag"
import SemesterFactory from "~/factories/semester"
import MockRequester from "~/setups/mock_requester"

import Controller from "./create.post"

const BODY_VALIDATION_INDEX = 0

describe("Controller: POST /api/semester", () => {
	const requester = new MockRequester()

	it("can accept valid info", async() => {
		const controller = new Controller()
		const { validations } = controller
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const semester = await new SemesterFactory().makeOne()
		requester.customizeRequest({
			"body": {
				"data": {
					"attributes": {
						"endAt": String(semester.endAt),
						"name": String(semester.name),
						"semesterOrder": semester.semesterOrder,
						"startAt": String(semester.startAt)
					},
					"type": "semester"
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
		requester.customizeRequest({
			"body": {
				"data": {
					"attributes": {
						"endAt": 1,
						"name": 1,
						"semesterOrder": 1,
						"startAt": 1
					},
					"type": "semester"
				}
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		const body = requester.expectFailure(ErrorBag).toJSON()

		expect(body).toHaveLength(4)
		expect(body).toHaveProperty("0.source.pointer", "data.attributes.endAt")
		expect(body).toHaveProperty("1.source.pointer", "data.attributes.name")
		expect(body).toHaveProperty("2.source.pointer", "data.attributes.semesterOrder")
		expect(body).toHaveProperty("3.source.pointer", "data.attributes.startAt")
	})
})
