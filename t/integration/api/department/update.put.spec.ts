import { JSON_API_MEDIA_TYPE } from "$/types/server"

import App from "~/set-ups/app"
import RoleFactory from "~/factories/role"
import DepartmentFactory from "~/factories/department"
import { UPDATE } from "$/permissions/department_combinations"
import RequestEnvironment from "$!/singletons/request_environment"
import { department as permissionGroup } from "$/permissions/permission_list"

import Route from "!/app/routes/api/department/update(id).patch"

describe("PATCH /api/department/update/:id", () => {
	beforeAll(async () => {
		await App.create(new Route())
	})

	it("can be accessed by authenticated user", async () => {
		const adminRole = await new RoleFactory()
			.departmentFlags(permissionGroup.generateMask(...UPDATE))
			.insertOne()
		const { user, cookie } = await App.makeAuthenticatedCookie(adminRole)
		const department = await (new DepartmentFactory()).insertOne()
		const newDepartmentDetails = await (new DepartmentFactory()).makeOne()

		const response = await App.request
			.patch(`/api/department/update/${department.id}`)
			.set("Cookie", cookie)
			.accept(JSON_API_MEDIA_TYPE)
			.send({
				data: {
					type: "department",
					id: department.id,
					attributes: {
						acronym: newDepartmentDetails.acronym,
						fullName: newDepartmentDetails.fullName,
						mayAdmit: newDepartmentDetails.mayAdmit
					}
				}
			})

		expect(response.statusCode).toBe(RequestEnvironment.status.NO_CONTENT)
	})

	it.todo("cannot accept invalid values")
	it.todo("cannot update missing model")
})
