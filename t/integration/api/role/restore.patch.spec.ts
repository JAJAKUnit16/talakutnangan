import { JSON_API_MEDIA_TYPE } from "!/types/independent"

import App from "~/set-ups/app"
import Role from "%/models/role"
import RoleFactory from "~/factories/role"
import RequestEnvironment from "$!/singletons/request_environment"
import { ARCHIVE_AND_RESTORE } from "$/permissions/role_combinations"
import { role as permissionGroup } from "$/permissions/permission_list"

import Route from "!/app/routes/api/role/restore(id).patch"

describe("PATCH /api/role/restore/:id", () => {
	beforeAll(async () => {
		await App.create(new Route())
	})

	it("can be accessed by authenticated user", async () => {
		const adminRole = await new RoleFactory()
			.roleFlags(permissionGroup.generateMask(...ARCHIVE_AND_RESTORE))
			.insertOne()
		const { user, cookie } = await App.makeAuthenticatedCookie(adminRole)
		const role = await (new RoleFactory()).insertOne()
		const id = role.id
		await role.destroy()

		const response = await App.request
			.patch(`/api/role/restore/${role.id}`)
			.set("Cookie", cookie)

		expect(response.statusCode).toBe(RequestEnvironment.status.NO_CONTENT)
		expect(response.body).toStrictEqual({})
		expect((await Role.findOne({ where: { id } }))!.deletedAt).toBeNull()
	})

	it.todo("cannot restore non-existing")
	it.todo("cannot restore existing")

	it("cannot be accessed without correct permission", async () => {
		const { user: admin, cookie } = await App.makeAuthenticatedCookie()
		const role = await (new RoleFactory()).insertOne()
		await role.destroy()

		const response = await App.request
			.patch(`/api/role/restore/${role.id}`)
			.set("Cookie", cookie)
			.accept(JSON_API_MEDIA_TYPE)

		expect(response.statusCode).toBe(RequestEnvironment.status.UNAUTHORIZED)
	})

	it("cannot be accessed by guest users", async () => {
		const role = await (new RoleFactory()).insertOne()

		const response = await App.request
			.patch(`/api/role/restore/${role.id}`)
			.accept(JSON_API_MEDIA_TYPE)

		expect(response.statusCode).toBe(RequestEnvironment.status.UNAUTHORIZED)
	})
})
