import { StatusCodes } from "http-status-codes"
import UserManager from "%/managers/user_manager"

import App from "~/app"
import UserFactory from "~/factories/user"
import Route from "!/app/routes/api/user/list.get"

describe("GET /api/user/list", () => {
	beforeAll(async () => {
		await App.create(new Route())
	})

	it("can be accessed by permitted user and get single unadmitted user", async () => {
		const { user: admin, cookie } = await App.makeAuthenticatedCookie()
		const manager = new UserManager()
		const student = await (new UserFactory()).beStudent().insertOne()

		const response = await App.request
			.get("/api/user/list")
			.query({ criteria: "unadmitted" })
			.set("Cookie", cookie)

		expect(response.statusCode).toBe(StatusCodes.OK)
		const expectedUser = await manager.findWithID(student.id)
		const refreshedAdmin = await manager.findWithID(admin.id)
		expect(response.body).toStrictEqual(
			JSON.parse(JSON.stringify([
				refreshedAdmin,
				expectedUser
			]))
		)
	})

	it.todo("can be accessed by permitted user and get multiple unadmitted users")
	it.todo("cannot be accessed by guest users")
})
