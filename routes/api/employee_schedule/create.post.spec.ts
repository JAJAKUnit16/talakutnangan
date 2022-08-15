import ErrorBag from "$!/errors/error_bag"
import UserFactory from "~/factories/user"
import MockRequester from "~/set-ups/mock_requester"
import EmployeeScheduleFactory from "~/factories/employee_schedule"
import Controller from "./create.post"

const BODY_VALIDATION_INDEX = 0

describe("Controller: POST /api/employee_schedule", () => {
	const requester = new MockRequester()

	it("can accept valid info", async() => {
		const controller = new Controller()
		const { validations } = controller
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const user = await new UserFactory().beReachableEmployee().insertOne()
		const employeeeSchedule = await new EmployeeScheduleFactory()
		.user(() => Promise.resolve(user))
		.makeOne()
		requester.customizeRequest({
			"body": {
				"data": {
					"type": "employee_schedule",
					"attributes": {
						"dayName": employeeeSchedule.dayName,
						"scheduleEnd": employeeeSchedule.scheduleEnd,
						"scheduleStart": employeeeSchedule.scheduleStart
					},
					"relationships": {
						"user": {
							"data": {
								"type": "user",
								"id": String(user.id)
							}
						}
					}
				}
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		requester.expectSuccess()
	})

	it("cannot accept invalid name", async() => {
		const controller = new Controller()
		const { validations } = controller
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const user = await new UserFactory().beReachableEmployee().insertOne()
		const employeeeSchedule = await new EmployeeScheduleFactory()
		.user(() => Promise.resolve(user))
		.makeOne()
		requester.customizeRequest({
			"body": {
				"data": {
					"type": "employee_schedule",
					"attributes": {
						"dayName": "tue",
						"scheduleEnd": employeeeSchedule.scheduleEnd,
						"scheduleStart": employeeeSchedule.scheduleStart
					},
					"relationships": {
						"user": {
							"data": {
								"type": "user",
								"id": String(user.id)
							}
						}
					}
				}
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		const body = requester.expectFailure(ErrorBag).toJSON()
		expect(body).toHaveLength(1)
		expect(body).toHaveProperty("0.source.pointer", "data.attributes.dayName")
	})
})
