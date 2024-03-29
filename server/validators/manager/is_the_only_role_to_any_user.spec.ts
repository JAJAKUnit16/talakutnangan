import type { Request } from "!/types/dependent"

import "~/setups/database.setup"
import Factory from "~/factories/role"
import UserFactory from "~/factories/user"
import makeInitialState from "!/validators/make_initial_state"
import IsTheOnlyRoleToAnyUser from "./is_the_only_role_to_any_user"

describe("Validator: Is the only role to any user", () => {
	it("can accept valid input", async() => {
		const model = await new Factory().insertOne()
		await new UserFactory().attach(model).insertOne()
		const value = Promise.resolve(makeInitialState(model.id))
		const constraints = {
			"field": "hello",
			"request": {} as Request,
			"source": null
		}

		const sanitizeValue = (await IsTheOnlyRoleToAnyUser(value, constraints)).value

		expect(sanitizeValue).toEqual(model.id)
	})

	it("cannot accept invalid value", async() => {
		const model = await new Factory().insertOne()
		const otherModel = await new Factory().insertOne()
		await new UserFactory().attach(model).attach(otherModel).insertOne()
		const value = Promise.resolve(makeInitialState(model.id))
		const constraints = {
			"field": "hello",
			"request": {} as Request,
			"source": null
		}

		try {
			await IsTheOnlyRoleToAnyUser(value, constraints)
		} catch (error) {
			expect(error).toHaveProperty("field", "hello")
			expect(error).toHaveProperty("messageMaker")
		}
	})
})
