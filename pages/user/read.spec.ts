import { flushPromises, mount } from "@vue/test-utils"

import RequestEnvironment from "$/singletons/request_environment"

import { user as permissionGroup } from "$/permissions/permission_list"
import { UPDATE_ANYONE_ON_ALL_DEPARTMENTS } from "$/permissions/user_combinations"

import Page from "./read.page.vue"

describe("Page: user/read", () => {
	it("can populate fields using pre-loaded data", async() => {
		const roles = {
			"data": [
				{
					"id": "1",
					"name": "Sample Role 1"
				},
				{
					"id": "2",
					"name": "Sample Role 2"
				},
				{
					"id": "3",
					"name": "Sample Role 3"
				}
			]
		}
		const departments = {
			"data": [
				{
					"fullName": "Sample Test Department",
					"id": "1"
				},
				{
					"fullName": "Sample Test Department aijveorivj",
					"id": "2"
				}
			]
		}
		const userRoles = {
			"data": [ roles.data[0] ]
		}
		const userDepartment = {
			"data": departments.data[0]
		}
		const user = {
			"data": {
				"department": userDepartment,
				"employeeSchedules": {
					"data": []
				},
				"kind": "reachable_employee",
				"name": "Sample User",
				"roles": userRoles
			}
		}
		const userProfile = {
			"data": {
				"department": userDepartment,
				"roles": {
					"data": [
						{
							"name": "A",
							"userFlags": permissionGroup.generateFlags(...UPDATE_ANYONE_ON_ALL_DEPARTMENTS)
						}
					]
				}
			}
		}
		fetchMock.mockResponseOnce(JSON.stringify({
			"data": [],
			"meta": {
				"count": 0
			}
		}), { "status": RequestEnvironment.status.OK })
		fetchMock.mockResponseOnce(JSON.stringify({
			"data": [],
			"meta": {
				"count": 0
			}
		}), { "status": RequestEnvironment.status.OK })
		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							departments,
							roles,
							user,
							userProfile
						}
					}
				}
			}
		})

		await flushPromises()
		const userNameInput = wrapper.find(".user-name input").element as HTMLInputElement
		const selectedRoles = wrapper.findAll(".selected-options li")
		const selectedDepartment
		= wrapper.find(".selectable-department select").element as HTMLSelectElement

		expect(userNameInput.value).toEqual(user.data.name)
		selectedRoles.forEach(
			(role, index) => expect(role.text()).toContain(userRoles.data[index].name)
		)
		expect(selectedDepartment.value).toEqual(userDepartment.data.id)
	})

	it("can update user information", async() => {
		fetchMock.mockResponseOnce(JSON.stringify({
			"data": [],
			"meta": {
				"count": 0
			}
		}), { "status": RequestEnvironment.status.OK })
		fetchMock.mockResponseOnce(JSON.stringify({
			"data": [],
			"meta": {
				"count": 0
			}
		}), { "status": RequestEnvironment.status.OK })
		fetchMock.mockResponseOnce("", { "status": RequestEnvironment.status.NO_CONTENT })
		fetchMock.mockResponseOnce("", { "status": RequestEnvironment.status.NO_CONTENT })
		fetchMock.mockResponseOnce("", { "status": RequestEnvironment.status.NO_CONTENT })
		fetchMock.mockResponseOnce("", { "status": RequestEnvironment.status.NO_CONTENT })

		const roles = {
			"data": [
				{
					"id": "1",
					"name": "Sample Role 1",
					"type": "role"
				},
				{
					"id": "2",
					"name": "Sample Role 2",
					"type": "role"
				},
				{
					"id": "3",
					"name": "Sample Role 3"
				}
			]
		}
		const departments = {
			"data": [
				{
					"fullName": "Sample Test Department",
					"id": "1",
					"type": "department"
				},
				{
					"fullName": "Sample Test Department aijveorivj",
					"id": "2",
					"type": "department"
				}
			]
		}
		const userRoles = {
			"data": [ roles.data[0] ]
		}
		const userDepartment = {
			"data": departments.data[0]
		}
		const user = {
			"data": {
				"department": userDepartment,
				"employeeSchedules": {
					"data": []
				},
				"id": "1",
				"kind": "reachable_employee",
				"name": "Sample User",
				"roles": userRoles
			}
		}
		const userProfile = {
			"data": {
				"department": userDepartment,
				"roles": {
					"data": [
						{
							"name": "A",
							"userFlags": permissionGroup.generateFlags(...UPDATE_ANYONE_ON_ALL_DEPARTMENTS)
						}
					]
				}
			}
		}
		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							departments,
							roles,
							user,
							userProfile
						}
					}
				}
			}
		})

		await flushPromises()
		await flushPromises()
		const userNameInput = wrapper.find(".user-name input")
		const updateUserBtn = wrapper.find(".update-user-btn")
		const updatedUser = {
			"data": {
				"department": {
					"data": departments.data[1]
				},
				"id": 1,
				"name": "New Name",
				"roles": {
					"data": [ ...user.data.roles.data, roles.data[1] ]
				}
			}
		}

		await userNameInput.setValue("New Name")
		await updateUserBtn.trigger("click")
		await flushPromises()

		const selectableRoles = wrapper.find(".selectable-roles select")
		const addSelectedRoleBtn = wrapper.find(".add-btn")
		const updateUserRolesBtn = wrapper.find(".update-roles-btn")
		const updatedUserRoles = {
			"data": updatedUser.data.roles.data.map(
				role => ({
					"id": role.id,
					"type": role.type
				})
			)
		}
		await selectableRoles.setValue(roles.data[1].id)
		await addSelectedRoleBtn.trigger("click")
		await updateUserRolesBtn.trigger("click")
		await flushPromises()

		const selectedDepartment = wrapper.find(".selectable-department select")
		const updateUserDepartmentBtn = wrapper.find(".update-department-btn")
		const updatedUserDepartment = {
			"data": {
				"id": updatedUser.data.department.data.id,
				"type": updatedUser.data.department.data.type
			}
		}
		await selectedDepartment.setValue(departments.data[1].id)
		await updateUserDepartmentBtn.trigger("submit")
		await flushPromises()


		const castFetch = fetch as jest.Mock<any, any>
		const [
			,
			,
			[ requestforUserInfo ],
			[ requestForAttachedRoles ],
			[ requestForAttachedDepartment ]
		] = castFetch.mock.calls
		expect(requestforUserInfo).toHaveProperty("method", "PATCH")
		expect(requestforUserInfo).toHaveProperty("url", `/api/user/${user.data.id}`)
		expect(JSON.stringify(await requestforUserInfo.json())).toContain(updatedUser.data.name)
		expect(requestForAttachedRoles).toHaveProperty("method", "PATCH")
		expect(requestForAttachedRoles).toHaveProperty(
			"url",
			`/api/user/${user.data.id}/relationships/role`
		)
		expect(await requestForAttachedRoles.json()).toEqual(updatedUserRoles)
		expect(requestForAttachedDepartment).toHaveProperty("method", "PATCH")
		expect(requestForAttachedDepartment).toHaveProperty(
			"url",
			`/api/user/${user.data.id}/relationships/department`
		)
		expect(await requestForAttachedDepartment.json()).toEqual(updatedUserDepartment)
	})
})
