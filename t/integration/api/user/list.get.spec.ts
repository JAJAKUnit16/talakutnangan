import RequestEnvironment from "$!/singletons/request_environment"

import App from "~/set-ups/app"
import RoleFactory from "~/factories/role"
import UserFactory from "~/factories/user"
import { user as permissionGroup } from "$/permissions/permission_list"
import { READ_ANYONE_ON_ALL_DEPARTMENTS } from "$/permissions/user_combinations"

import Route from "!/app/routes/api/user/list.get"

describe("GET /api/user/list", () => {
	beforeAll(async () => {
		await App.create(new Route())
	})

	it("can be accessed by permitted user and get single complete user", async () => {
		const adminRole = await new RoleFactory()
			.userFlags(permissionGroup.generateMask(...READ_ANYONE_ON_ALL_DEPARTMENTS))
			.insertOne()
		const { user: admin, cookie } = await App.makeAuthenticatedCookie(adminRole)
		const student = await ((new UserFactory()).beStudent()).insertOne()

		const response = await App.request
			.get("/api/user/list")
			.query({ criteria: "complete" })
			.set("Cookie", cookie)

		expect(response.statusCode).toBe(RequestEnvironment.status.OK)
		expect(response.body).toHaveProperty("data.0.attributes.email", admin.email)
		expect(response.body).toHaveProperty("data.1.attributes.email", student.email)
	})

	it("cannot be accessed by an unauthorized user", async () => {
		const adminRole = await new RoleFactory()
			.userFlags(permissionGroup.generateMask(READ_ANYONE_ON_ALL_DEPARTMENTS[0]))
			.insertOne()
		const { user: admin, cookie } = await App.makeAuthenticatedCookie(adminRole)
		const student = await ((new UserFactory()).beStudent()).insertOne()

		const response = await App.request
			.get("/api/user/list")
			.set("Cookie", cookie)

		expect(response.statusCode).toBe(RequestEnvironment.status.UNAUTHORIZED)
	})

	it("cannot be accessed by a guest user", async () => {
		const response = await App.request.get("/api/user/list")

		expect(response.statusCode).toBe(RequestEnvironment.status.UNAUTHORIZED)
	})
})
