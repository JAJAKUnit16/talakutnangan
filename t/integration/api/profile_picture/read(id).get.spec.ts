import App from "~/setups/app"
import RoleFactory from "~/factories/role"
import ProfilePictureFactory from "~/factories/profile_picture"
import RequestEnvironment from "$!/singletons/request_environment"

import { READ_OWN } from "$/permissions/user_combinations"
import { user as permissionGroup } from "$/permissions/permission_list"

import Route from "!%/api/profile_picture/read(id).get"

describe("GET /api/profile_picture/:id", () => {
	beforeAll(async() => {
		await App.create(new Route())
	})

	it("can read profile picture", async() => {
		const profilePicture = await new ProfilePictureFactory().insertOne()
		const studentRole = await new RoleFactory()
		.userFlags(permissionGroup.generateFlags(...READ_OWN))
		.insertOne()
		const { cookie } = await App.makeAuthenticatedCookie(
			studentRole,
			userFactory => userFactory.beReachableEmployee()
		)

		const response = await App.request
		.get(`/api/profile_picture/${profilePicture.id}`)
		.set("Cookie", cookie)

		expect(response.statusCode).toBe(RequestEnvironment.status.OK)
		expect(response.body).toStrictEqual(profilePicture.fileContents)
	})
})
