import { StatusCodes } from "http-status-codes"
import UserManager from "%/managers/user_manager"

import App from "~/app"
import UserFactory from "~/factories/user"
import Route from "!/routes/api/user/update.patch"

describe("PATCH /api/user/update/:id", () => {
	beforeAll(async () => {
		await App.create("/api/user", new Route())
	})

	it("can be accessed by permitted user and admit other user", async () => {
		const manager = new UserManager()
		// const admin = await (new UserFactory()).verified().insertOne()
		const student = await (new UserFactory()).insertOne()

		const response = await App.request
			.patch(`/api/user/update/${student.id}`)
			.query({ confirm: true })

		expect(response.statusCode).toBe(StatusCodes.ACCEPTED)

		const updatedStudent = await manager.findWithID(student.id)
		expect(updatedStudent.admittedAt).not.toBeNull()
	})

	it.todo("can be accessed by permitted user and admit multiple users")
	it.todo("can be accessed by permitted user and readmit users")
	it.todo("cannot be accessed by guest users")
})
