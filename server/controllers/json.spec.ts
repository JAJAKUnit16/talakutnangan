import { faker } from "@faker-js/faker"

import type { FieldRules } from "!/types/validation"
import type { Request, Response } from "!/types/dependent"

import required from "!/validators/base/required"
import regex from "!/validators/comparison/regex"
import MockRequester from "~/setups/mock_requester"

import JSONController from "./json"

describe("Back-end: JSON Controller Special Validation", () => {
	const requester = new MockRequester()

	abstract class BaseTestController extends JSONController {
		get filePath(): string { return __filename }

		get policy(): null { return null }
	}

	it("does validation middleware works properly with valid values", async() => {
		const controller = new class extends BaseTestController {
			makeBodyRuleGenerator(unusedRequest: Request): FieldRules {
				return {
					"email": {
						"constraints": {
							"regex": {
								"match": /.*@.*/u
							}
						},
						"pipes": [ required, regex ]
					}
				}
			}

			get filePath(): string { return __filename }

			handle(unusedRequest: Request, unusedResponse: Response)
			: Promise<void> { return Promise.resolve() }
		}()

		const { middlewares } = controller
		const validationMiddleware = middlewares[middlewares.length - 1]
		requester.customizeRequest({
			"body": {
				"email": faker.internet.exampleEmail()
			}
		})

		await requester.runMiddleware(validationMiddleware!.intermediate.bind(validationMiddleware))

		requester.expectSuccess()
	})
})
