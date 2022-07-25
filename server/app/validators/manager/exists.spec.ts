import UserManager from "%/managers/user"
import UserFactory from "~/factories/user"
import makeInitialState from "!/app/validators/make_initial_state"
import exists from "./exists"

describe("Validator: exists", () => {
	it("can accept valid input", async () => {
		const user = await (new UserFactory()).insertOne()
		const value = Promise.resolve(makeInitialState(user.name))
		const constraints = {
			request: null,
			field: "hello",
			manager: {
				className: UserManager,
				columnName: "name"
			}
		}

		const sanitizeValue = (await exists(value, constraints)).value

		expect(sanitizeValue).toEqual(user.name)
	})

	it("cannot accept archived value", async () => {
		const user = await (new UserFactory()).insertOne()
		const value = Promise.resolve(makeInitialState(user.name))
		const constraints = {
			request: null,
			field: "hello",
			manager: {
				className: UserManager,
				columnName: "name"
			}
		}
		await user.destroy({ force: false })

		const error = exists(value, constraints)

		expect(error).rejects.toHaveProperty("field", "hello")
		expect(error).rejects.toHaveProperty("messageMaker")
	})

	it("cannot accept invalid value", async () => {
		const user = "hello"
		const value = Promise.resolve(makeInitialState(user))
		const constraints = {
			request: null,
			field: "hello",
			manager: {
				className: UserManager,
				columnName: "name"
			}
		}

		const error = exists(value, constraints)

		expect(error).rejects.toHaveProperty("field", "hello")
		expect(error).rejects.toHaveProperty("messageMaker")
	})
})
