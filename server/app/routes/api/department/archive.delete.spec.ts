import ErrorBag from "$!/errors/error_bag"
import MockRequester from "~/set-ups/mock_requester"
import DepartmentFactory from "~/factories/department"
import registerCustomValidators from "!/app/auth/register_custom_validators"

import Controller from "./archive.delete"

const BODY_VALIDATION_INDEX = 0

describe("Controller: DELETE /api/department/archive", () => {
	const requester = new MockRequester()

	beforeAll(() => {
		registerCustomValidators()
	})

	it("can accept valid info", async () => {
		const controller = new Controller()
		const validations = controller.validations
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const department = await (new DepartmentFactory()).insertOne()
		requester.customizeRequest({
			body: {
				data: [
					{
						type: "department",
						id: department.id
					}
				]
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		requester.expectSuccess()
	})

	it("cannot accept already-archived resources", async () => {
		const controller = new Controller()
		const validations = controller.validations
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const department = await (new DepartmentFactory()).insertOne()
		await department.destroy({ force: false })
		requester.customizeRequest({
			body: {
				data: [
					{
						type: "department",
						id: department.id
					}
				]
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		const body = requester.expectFailure(ErrorBag).toJSON()
		expect(body).toHaveLength(1)
		expect(body).toHaveProperty("0.source.pointer", "data.0")
	})

	it("cannot delete non-existent resources", async () => {
		const controller = new Controller()
		const validations = controller.validations
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const department = await (new DepartmentFactory()).insertOne()
		await department.destroy({ force: true })
		requester.customizeRequest({
			body: {
				data: [
					{
						type: "department",
						id: department.id
					}
				]
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		const body = requester.expectFailure(ErrorBag).toJSON()
		expect(body).toHaveLength(1)
		expect(body).toHaveProperty("0.source.pointer", "data.0")
	})
})
