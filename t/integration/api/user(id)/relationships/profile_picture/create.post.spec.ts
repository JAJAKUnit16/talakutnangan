import { MULTIPART_MEDIA_TYPE, JSON_API_MEDIA_TYPE } from "$/types/server"

import App from "~/set-ups/app"
import RoleFactory from "~/factories/role"
import URLMaker from "$!/singletons/url_maker"
import ProfilePictureFactory from "~/factories/profile_picture"
import RequestEnvironment from "$!/singletons/request_environment"

import { UPDATE_OWN_DATA } from "$/permissions/user_combinations"
import { user as permissionGroup } from "$/permissions/permission_list"

import Route from "!%/api/user(id)/relationships/profile_picture/create.post"

describe("POST /api/user/:id/relationships/profile_picture", () => {
	beforeAll(async () => {
		await App.create(new Route())
	})

	it("can create profile picture", async () => {
		URLMaker.initialize("http", "localhost", 16000, "/")

		const studentRole = await new RoleFactory()
			.userFlags(permissionGroup.generateMask(...UPDATE_OWN_DATA))
			.insertOne()
		const { user: student, cookie } = await App.makeAuthenticatedCookie(
			studentRole,
			userFactory => userFactory.beStudent()
		)
		const path = `${RequestEnvironment.root}/t/data/logo_bg_transparent.png`

		const response = await App.request
			.post(`/api/user/${student.id}/relationships/profile_picture`)
			.field("data[type]", "profile_picture")
			.attach("data[attributes][fileContents]", path)
			.set("Cookie", cookie)
			.type(MULTIPART_MEDIA_TYPE)
			.accept(JSON_API_MEDIA_TYPE)

		expect(response.statusCode).toBe(RequestEnvironment.status.CREATED)
		expect(response.body).toHaveProperty("data.type", "profile_picture")
		expect(response.body).toHaveProperty("data.id")
		expect(response.body).toHaveProperty(
			"data.links.self",
			"http://localhost:16000/api/profile_picture/"+response.body.data.id
		)
	}, 10000)

	it("cannot create multiple profile picture", async () => {
		URLMaker.initialize("http", "localhost", 16000, "/")

		const studentRole = await new RoleFactory()
			.userFlags(permissionGroup.generateMask(...UPDATE_OWN_DATA))
			.insertOne()
		const { user: student, cookie } = await App.makeAuthenticatedCookie(
			studentRole,
			userFactory => userFactory.beStudent()
		)
		const path = `${RequestEnvironment.root}/t/data/logo_bg_transparent.png`
		await new ProfilePictureFactory().user(async () => student).insertOne()

		const response = await App.request
			.post(`/api/user/${student.id}/relationships/profile_picture`)
			.field("data[type]", "profile_picture")
			.attach("data[attributes][fileContents]", path)
			.set("Cookie", cookie)
			.type(MULTIPART_MEDIA_TYPE)
			.accept(JSON_API_MEDIA_TYPE)

		expect(response.statusCode).toBe(RequestEnvironment.status.BAD_REQUEST)
	})
})
