import ErrorBag from "$!/errors/error_bag"
import UserFactory from "~/factories/user"
import MockRequester from "~/set-ups/mock_requester"
import EmployeeScheduleFactory from "~/factories/employee_schedule"
import Controller from "./update(id).patch"

const BODY_VALIDATION_INDEX = 1

describe("Controller: PATCH /api/employee_schedule", () => {
	const requester = new MockRequester()

	it("can accept valid info", async() => {
		const controller = new Controller()
		const { validations } = controller
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const user = await new UserFactory().beReachableEmployee().insertOne()
		const employeeeSchedule = await new EmployeeScheduleFactory()
		.user(() => Promise.resolve(user))
		.insertOne()
		const newEmployeeeSchedule = await new EmployeeScheduleFactory()
		.user(() => Promise.resolve(user))
		.makeOne()
		requester.customizeRequest({
			"body": {
				"data": {
					"type": "employee_schedule",
					"id": String(employeeeSchedule.id),
					"attributes": {
						"dayName": newEmployeeeSchedule.dayName,
						"scheduleEnd": newEmployeeeSchedule.scheduleEnd,
						"scheduleStart": newEmployeeeSchedule.scheduleStart
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
		.insertOne()
		const newEmployeeeSchedule = await new EmployeeScheduleFactory()
		.user(() => Promise.resolve(user))
		.makeOne()
		requester.customizeRequest({
			"body": {
				"data": {
					"type": "employee_schedule",
					"id": String(employeeeSchedule.id),
					"attributes": {
						"dayName": "tue",
						"scheduleEnd": newEmployeeeSchedule.scheduleEnd,
						"scheduleStart": newEmployeeeSchedule.scheduleStart
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
