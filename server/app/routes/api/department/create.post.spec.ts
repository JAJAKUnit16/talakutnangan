import ErrorBag from "$!/errors/error_bag"
import MockRequester from "~/set-ups/mock_requester"
import DepartmentFactory from "~/factories/department"
import registerCustomValidators from "!/app/auth/register_custom_validators"
import Controller from "./create.post"

const BODY_VALIDATION_INDEX = 0

describe("Controller: POST /api/department/create", () => {
	const requester = new MockRequester()

	beforeAll(() => {
		registerCustomValidators()
	})

	it("can accept valid info", async () => {
		const controller = new Controller()
		const validations = controller.validations
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const department = await (new DepartmentFactory()).makeOne()
		requester.customizeRequest({
			body: {
				data: {
					type: "department",
					attributes: {
						acronym: department.acronym,
						fullName: department.fullName,
						mayAdmit: department.mayAdmit
					}
				}
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		requester.expectSuccess()
	})

	it("can accept valid info with all-uppercase name", async () => {
		const controller = new Controller()
		const validations = controller.validations
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const department = await (new DepartmentFactory().name(() => "Abc Def GHIJ")).makeOne()
		requester.customizeRequest({
			body: {
				acronym: department.acronym,
				fullName: department.fullName,
				mayAdmit: department.mayAdmit
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		requester.expectSuccess()
	})

	it("cannot accept invalid full name", async () => {
		const controller = new Controller()
		const validations = controller.validations
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const department = await (new DepartmentFactory()).makeOne()
		requester.customizeRequest({
			body: {
				data: {
					type: "department",
					attributes: {
						acronym: department.acronym,
						fullName: department.fullName+"1",
						mayAdmit: department.mayAdmit
					}
				}
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		const body = requester.expectFailure(ErrorBag).toJSON()
		expect(body).toHaveLength(1)
		expect(body).toHaveProperty("0.source.pointer", "fullName")
	})

	it("cannot accept invalid full name (as suggested by #211)", async () => {
		const controller = new Controller()
		const validations = controller.validations
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const department = await new DepartmentFactory()
			.name(() => "Hacking Lavender Throughway1")
			.makeOne()
		requester.customizeRequest({
			body: {
				data: {
					type: "department",
					attributes: {
						acronym: department.acronym,
						fullName: department.fullName+"1",
						mayAdmit: department.mayAdmit
					}
				}
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		const body = requester.expectFailure(ErrorBag).toJSON()
		expect(body).toHaveLength(1)
		expect(body).toHaveProperty("0.source.pointer", "data.attributes.fullName")
	})

	it("cannot accept invalid acronym", async () => {
		const controller = new Controller()
		const validations = controller.validations
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const department = await (new DepartmentFactory()).makeOne()
		const randomData = await (new DepartmentFactory()).makeOne() // Used for generate random data
		requester.customizeRequest({
			body: {
				data: {
					type: "department",
					attributes: {
						acronym: department.acronym+randomData.acronym,
						fullName: department.fullName,
						mayAdmit: department.mayAdmit
					}
				}
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		const body = requester.expectFailure(ErrorBag).toJSON()
		expect(body).toHaveLength(1)
		expect(body).toHaveProperty("0.source.pointer", "data.attributes.acronym")
	})

	it("cannot accept invalid value if it should be admitted", async () => {
		const controller = new Controller()
		const validations = controller.validations
		const bodyValidation = validations[BODY_VALIDATION_INDEX]
		const bodyValidationFunction = bodyValidation.intermediate.bind(bodyValidation)
		const department = await (new DepartmentFactory()).makeOne()
		requester.customizeRequest({
			body: {
				data: {
					type: "department",
					attributes: {
						acronym: department.acronym,
						fullName: department.fullName,
						mayAdmit: "123"
					}
				}
			}
		})

		await requester.runMiddleware(bodyValidationFunction)

		const body = requester.expectFailure(ErrorBag).toJSON()
		expect(body).toHaveLength(1)
		expect(body).toHaveProperty("0.source.pointer", "data.attributes.mayAdmit")
	})
})
