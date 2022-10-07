import MockRequester from "~/setups/mock_requester"

import AuthorizationError from "$!/errors/authorization"
import AuthenticationBasedPolicy from "./authentication-based"

describe("Middleware: Authenticated-Based Policy", () => {
	const requester = new MockRequester()

	it("can allow guest users if guests are expected", async() => {
		const authenticatedGuard = new AuthenticationBasedPolicy(false)
		requester.customizeRequest({
			"isAuthenticated": jest.fn().mockReturnValue(false),
			"user": {}
		})

		await requester.runMiddleware(authenticatedGuard.intermediate.bind(authenticatedGuard))

		requester.expectSuccess()
	})

	it("cannot allow known users if guest are expected", async() => {
		const authenticatedGuard = new AuthenticationBasedPolicy(false)
		requester.customizeRequest({
			"isAuthenticated": jest.fn().mockReturnValue(true),
			"user": {}
		})

		await requester.runMiddleware(authenticatedGuard.intermediate.bind(authenticatedGuard))

		requester.expectNext([
			[
				(error: any) => expect(error).toBeInstanceOf(AuthorizationError)
			]
		])
	})

	it("can allow known users if known are expected", async() => {
		const authenticatedGuard = new AuthenticationBasedPolicy(true)
		requester.customizeRequest({
			"isAuthenticated": jest.fn().mockReturnValue(true),
			"user": {
				"meta": {
					"hasDefaultPassword": false
				}
			}
		})

		await requester.runMiddleware(authenticatedGuard.intermediate.bind(authenticatedGuard))

		requester.expectSuccess()
	})

	it("cannot allow guest users if known are expected", async() => {
		const authenticatedGuard = new AuthenticationBasedPolicy(true)
		requester.customizeRequest({
			"isAuthenticated": jest.fn().mockReturnValue(false),
			"user": {}
		})

		await requester.runMiddleware(authenticatedGuard.intermediate.bind(authenticatedGuard))

		requester.expectNext([
			[
				(error: any) => expect(error).toBeInstanceOf(AuthorizationError)
			]
		])
	})

	it("can allow known users with no default password", async() => {
		const authenticatedGuard = new AuthenticationBasedPolicy(true, {
			"requireChangedPassword": false
		})
		requester.customizeRequest({
			"isAuthenticated": jest.fn().mockReturnValue(true),
			"user": {
				"meta": {
					"hasDefaultPassword": false
				}
			}
		})

		await requester.runMiddleware(authenticatedGuard.intermediate.bind(authenticatedGuard))

		requester.expectNext([
			[
				(error: any) => expect(error).toBeInstanceOf(AuthorizationError)
			]
		])
	})

	it("cannot allow known users with no default password", async() => {
		const authenticatedGuard = new AuthenticationBasedPolicy(true, {
			"requireChangedPassword": true
		})
		requester.customizeRequest({
			"isAuthenticated": jest.fn().mockReturnValue(true),
			"user": {
				"meta": {
					"hasDefaultPassword": false
				}
			}
		})

		await requester.runMiddleware(authenticatedGuard.intermediate.bind(authenticatedGuard))

		requester.expectNext([
			[
				(error: any) => expect(error).toBeInstanceOf(AuthorizationError)
			]
		])
	})
})
