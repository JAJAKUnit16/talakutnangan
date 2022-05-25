import { StatusCodes } from "http-status-codes"

import App from "~/app"
import UserFactory from "~/factories/user"

describe("GET /api/user/list", () => {
	it("can be accessed by permitted user and get single unadmitted user", async () => {
		const user = await (new UserFactory()).verified().insertOne()

		const response = await App.request
			.get("/api/user/list")
			.query({ criteria: "unadmitted" })

		expect(response.statusCode).toBe(StatusCodes.OK)
		expect(response.body).toStrictEqual([
			JSON.parse(JSON.stringify(user))
		])
	})

	it.todo("can be accessed by permitted user and get multiple unadmitted users")
	it.todo("cannot be accessed by guest users")
})
