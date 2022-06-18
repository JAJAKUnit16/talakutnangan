import { Request, Response } from "!/types/dependent"

import MockRequester from "~/set-ups/mock_requester"
import RouteParameterValidation from "!/middlewares/authorization/route_parameter_validation"

import BoundController from "./bound_controller"

abstract class BaseTestController extends BoundController {
	get filePath(): string { return __filename }

	get policy(): null { return null }

	handle(_request: Request, _response: Response): Promise<void> { return Promise.resolve() }
}

describe("Controller: Bound Controller Validation", () => {
	it("does include validation middleware", async () => {
		const controller = new class extends BaseTestController {
			get routeParameterValidationRules(): object { return {} }
		}

		const middlewares = controller.middlewares
		const lastMiddleware = middlewares[middlewares.length - 1]

		expect(lastMiddleware instanceof RouteParameterValidation).toBeTruthy()
	})
})

describe("Controller: Bound Controller Request", () => {
	const requester  = new MockRequester()

	it("does validation middleware works properly with valid values", async () => {
		const controller = new class extends BaseTestController {
			get routeParameterValidationRules(): object {
				return {
					id: ["required", "numeric"]
				}
			}
		}

		const middlewares = controller.middlewares
		const validationMiddleware = middlewares[middlewares.length - 1]
		requester.customizeRequest({
			params: {
				id: "1"
			}
		})

		await requester.runMiddleware(validationMiddleware!.intermediate.bind(validationMiddleware))

		requester.expectSuccess()
	})

	it("does validation middleware works properly with invalid single value", async () => {
		const controller = new class extends BaseTestController {
			get routeParameterValidationRules(): object {
				return {
					id: ["required", "numeric"]
				}
			}
		}

		const middlewares = controller.middlewares
		const validationMiddleware = middlewares[middlewares.length - 1]
		requester.customizeRequest({
			params: {
				id: "NaN"
			}
		})

		await requester.runMiddleware(validationMiddleware!.intermediate.bind(validationMiddleware))

		const errorJSONBody = requester.expectFailure(requester.status.BAD_REQUEST)
		expect(errorJSONBody).toHaveProperty([0, "field"], "id")
	})

	it("does validation middleware works properly with invalid multiple values", async () => {
		const controller = new class extends BaseTestController {
			get filePath(): string { return __filename }
			handle(request: Request, response: Response): Promise<void> { return Promise.resolve() }
			get routeParameterValidationRules(): object {
				return {
					id: ["required", "numeric"],
					commentID: ["required", "numeric"]
				}
			}
		}

		const middlewares = controller.middlewares
		const validationMiddleware = middlewares[middlewares.length - 1]
		requester.customizeRequest({
			params: {
				id: "NaN",
				commentID: "Infinite"
			}
		})

		await requester.runMiddleware(validationMiddleware!.intermediate.bind(validationMiddleware))

		const errorJSONBody = requester.expectFailure(requester.status.BAD_REQUEST)
		expect(errorJSONBody).toHaveProperty([0, "field"], "commentID")
		expect(errorJSONBody).toHaveProperty([1, "field"], "id")
	})
})
