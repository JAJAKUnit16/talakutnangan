import type { Request } from "!/types/dependent"

import "~/set-ups/database.set_up"
import UserManager from "%/managers/user"
import UserFactory from "~/factories/user"
import makeInitialState from "!/validators/make_initial_state"
import existWithSameAttribute from "./exist_with_same_attribute"

describe("Validator: exist wth same attribute", () => {
	it("can accept valid input", async() => {
		const user = await new UserFactory().insertOne()
		const value = Promise.resolve(makeInitialState(user.id))
		const constraints = {
			"request": {} as Request,
			"source": null,
			"field": "hello",
			"manager": {
				"className": UserManager,
				"columnName": "id"
			},
			"sameAttribute": {
				"columnName": "name",
				"value": user.name
			}
		}

		const sanitizeValue = (await existWithSameAttribute(value, constraints)).value

		expect(sanitizeValue).toEqual(user.id)
	})

	it("can accept archived value", async() => {
		const user = await new UserFactory().insertOne()
		const value = Promise.resolve(makeInitialState(user.id))
		const constraints = {
			"request": {} as Request,
			"source": null,
			"field": "hello",
			"manager": {
				"className": UserManager,
				"columnName": "id"
			},
			"sameAttribute": {
				"columnName": "name",
				"value": "name"
			}
		}
		await user.destroy({ "force": false })

		const error = existWithSameAttribute(value, constraints)

		expect(error).rejects.toHaveProperty("field", "hello")
		expect(error).rejects.toHaveProperty("messageMaker")
	})

	it("cannot accept invalid value", async() => {
		const user = await new UserFactory().insertOne()
		const value = Promise.resolve(makeInitialState(user.id))
		const constraints = {
			"request": {} as Request,
			"source": null,
			"field": "hello",
			"manager": {
				"className": UserManager,
				"columnName": "id"
			},
			"sameAttribute": {
				"columnName": "name",
				"value": `${user.name}name`
			}
		}
		const error = existWithSameAttribute(value, constraints)

		expect(error).rejects.toHaveProperty("field", "hello")
		expect(error).rejects.toHaveProperty("messageMaker")
	})
})
