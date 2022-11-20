/* eslint-disable max-lines */
import { mount, flushPromises } from "@vue/test-utils"

import RequestEnvironment from "$/singletons/request_environment"
import { UPDATE, ARCHIVE_AND_RESTORE } from "$/permissions/role_combinations"

import Factory from "~/factories/role"
import {
	tag,
	user,
	post,
	comment,
	semester,
	department,
	role
} from "$/permissions/permission_list"

import Page from "./read.page.vue"

describe("UI Page: Read resource by ID", () => {
	it("render properly", async() => {
		const sampleResource = await new Factory()
		.departmentFlags(department.generateMask("view"))
		.roleFlags(role.generateMask("view"))
		.semesterFlags(semester.generateMask("view"))
		.tagFlags(tag.generateMask("view"))
		.postFlags(post.generateMask("view"))
		.commentFlags(comment.generateMask("view"))
		.userFlags(user.generateMask("view"))
		.auditTrailFlags(0)
		.deserializedOne()

		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							"role": sampleResource,
							"userProfile": {
								"data": {
									"roles": {
										"data": [
											{
												"name": "A",
												"roleFlags": 0
											}
										]
									}
								}
							}
						}
					}
				}
			}
		})

		const viewCheckboxes = wrapper.findAll("input[type=checkbox][value=view]")

		const checkedValues = viewCheckboxes.map(checkbox => {
			const castCheckbox = checkbox.element as HTMLInputElement
			return castCheckbox.checked
		})

		expect(checkedValues).toEqual([
			// Semester Flags
			true,
			// Tag Flags
			true,
			// Post Flags
			true,
			// Comment Flags
			true,
			// Profanity Flags
			true,
			// User Flags
			true,
			// Audit Trail Flags
			false
		])
	})

	it("should uncheck dependent permissions", async() => {
		const sampleResource = await new Factory()
		.departmentFlags(department.generateMask("view"))
		.roleFlags(role.generateMask("view"))
		.semesterFlags(semester.generateMask("view"))
		.tagFlags(tag.generateMask("view", "create", "update", "archiveAndRestore"))
		.postFlags(post.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope",
			"tag"
		))
		.commentFlags(comment.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope",
			"vote"
		))
		.userFlags(user.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope"
		))
		.auditTrailFlags(0)
		.deserializedOne()

		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							"role": sampleResource,
							"userProfile": {
								"data": {
									"roles": {
										"data": [
											{
												"name": "A",
												"roleFlags": role.generateMask(...UPDATE)
											}
										]
									}
								}
							}
						}
					}
				}
			}
		})

		const createCommentPermission = wrapper.find(
			"#comment-flags input[type=checkbox][value=create]"
		)
		const viewPostPermission = wrapper.find("#post-flags input[type=checkbox][value=view]")
		const viewCommentPermission = wrapper.find("#comment-flags input[type=checkbox][value=view]")

		await viewCommentPermission.setValue(false)

		const castViewPostPermissionCheckbox = viewPostPermission.element as HTMLInputElement
		const castCreateCommentPermissionCheckbox = createCommentPermission
		.element as HTMLInputElement
		expect(castViewPostPermissionCheckbox.checked).toBeTruthy()
		expect(castCreateCommentPermissionCheckbox.checked).toBeFalsy()
	})

	it("should uncheck externally dependent permissions", async() => {
		const sampleResource = await new Factory()
		.departmentFlags(department.generateMask("view"))
		.roleFlags(role.generateMask("view"))
		.semesterFlags(semester.generateMask("view"))
		.tagFlags(tag.generateMask("view"))
		.postFlags(post.generateMask("view"))
		.commentFlags(comment.generateMask("view", "create"))
		.userFlags(user.generateMask("view"))
		.auditTrailFlags(0)
		.deserializedOne()

		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							"role": sampleResource,
							"userProfile": {
								"data": {
									"roles": {
										"data": [
											{
												"name": "A",
												"roleFlags": role.generateMask(...UPDATE)
											}
										]
									}
								}
							}
						}
					}
				}
			}
		})

		const createCommentPermission = wrapper.find(
			"#comment-flags input[type=checkbox][value=create]"
		)
		const viewPostPermission = wrapper.find("#post-flags input[type=checkbox][value=view]")
		const viewCommentPermission = wrapper.find("#comment-flags input[type=checkbox][value=view]")

		await viewPostPermission.setValue(false)

		const castViewCommentPermissionCheckbox = viewCommentPermission.element as HTMLInputElement
		const castCreateCommentPermissionCheckbox = createCommentPermission
		.element as HTMLInputElement
		expect(castViewCommentPermissionCheckbox.checked).toBeFalsy()
		expect(castCreateCommentPermissionCheckbox.checked).toBeFalsy()
	})

	it("should check external dependency permissions", async() => {
		const sampleResource = await new Factory()
		.departmentFlags(department.generateMask("view"))
		.roleFlags(role.generateMask("view"))
		.semesterFlags(semester.generateMask("view"))
		.tagFlags(tag.generateMask("view"))
		.postFlags(0)
		.commentFlags(0)
		.userFlags(user.generateMask("view"))
		.auditTrailFlags(0)
		.deserializedOne()

		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							"role": sampleResource,
							"userProfile": {
								"data": {
									"roles": {
										"data": [
											{
												"name": "A",
												"roleFlags": role.generateMask(...UPDATE)
											}
										]
									}
								}
							}
						}
					}
				}
			}
		})

		const createCommentPermission = wrapper.find(
			"#comment-flags input[type=checkbox][value=create]"
		)
		const viewPostPermission = wrapper.find("#post-flags input[type=checkbox][value=view]")
		const viewCommentPermission = wrapper.find("#comment-flags input[type=checkbox][value=view]")

		await createCommentPermission.setValue(true)

		const castViewPostPermissionCheckbox = viewPostPermission.element as HTMLInputElement
		const castViewCommentPermissionCheckbox = viewCommentPermission.element as HTMLInputElement
		expect(castViewPostPermissionCheckbox.checked).toBeTruthy()
		expect(castViewCommentPermissionCheckbox.checked).toBeTruthy()
	})

	it("can edit role name", async() => {
		const sampleResource = await new Factory()
		.departmentFlags(department.generateMask("view"))
		.roleFlags(role.generateMask("view"))
		.semesterFlags(semester.generateMask("view"))
		.tagFlags(tag.generateMask("view", "create", "update", "archiveAndRestore"))
		.postFlags(post.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope",
			"tag"
		))
		.commentFlags(comment.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope",
			"vote"
		))
		.userFlags(user.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope"
		))
		.auditTrailFlags(0)
		.deserializedOne(true)
		const newSampleModel = await new Factory().makeOne()

		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							"role": sampleResource,
							"userProfile": {
								"data": {
									"roles": {
										"data": [
											{
												"name": "A",
												"roleFlags": role.generateMask(...UPDATE)
											}
										]
									}
								}
							}
						}
					}
				}
			}
		})

		const roleName = wrapper.find("input[type='text']")
		const submit = wrapper.find("[type='submit']")

		await roleName.setValue(newSampleModel.name)
		await submit.trigger("submit")
		await flushPromises()

		const castFetch = fetch as jest.Mock<any, any>
		expect(castFetch).not.toHaveBeenCalled()
	})

	it("should be archivable", async() => {
		const sampleResource = await new Factory()
		.departmentFlags(department.generateMask("view"))
		.roleFlags(role.generateMask("view"))
		.semesterFlags(semester.generateMask("view"))
		.tagFlags(tag.generateMask("view", "create", "update", "archiveAndRestore"))
		.postFlags(post.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope",
			"tag"
		))
		.commentFlags(comment.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope",
			"vote"
		))
		.userFlags(user.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope"
		))
		.auditTrailFlags(0)
		.deserializedOne(true)

		fetchMock.mockResponseOnce("{}", { "status": RequestEnvironment.status.NO_CONTENT })

		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							"role": sampleResource,
							"userProfile": {
								"data": {
									"roles": {
										"data": [
											{
												"name": "A",
												"roleFlags": role.generateMask(...ARCHIVE_AND_RESTORE)
											}
										]
									}
								}
							}
						}
					}
				}
			}
		})
		const archiveBtn = wrapper.find(".archive-btn")
		await archiveBtn.trigger("click")
		await flushPromises()

		const castFetch = fetch as jest.Mock<any, any>
		const [ [ request ] ] = castFetch.mock.calls
		expect(request).toHaveProperty("method", "DELETE")
		expect(request).toHaveProperty("url", "/api/role")
	})

	it("should be restorable", async() => {
		const sampleModel = await new Factory()
		.departmentFlags(department.generateMask("view"))
		.roleFlags(role.generateMask("view"))
		.semesterFlags(semester.generateMask("view"))
		.tagFlags(tag.generateMask("view", "create", "update", "archiveAndRestore"))
		.postFlags(post.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope",
			"tag"
		))
		.commentFlags(comment.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope",
			"vote"
		))
		.userFlags(user.generateMask(
			"view",
			"create",
			"update",
			"archiveAndRestore",
			"readDepartmentScope",
			"writeDepartmentScope"
		))
		.auditTrailFlags(0)
		.insertOne()

		await sampleModel.destroy()
		sampleModel.deletedAt = new Date("2022-10-20 10:00")
		const sampleResource = await new Factory().deserialize(sampleModel)

		fetchMock.mockResponseOnce("{}", { "status": RequestEnvironment.status.NO_CONTENT })

		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							"role": sampleResource,
							"userProfile": {
								"data": {
									"roles": {
										"data": [
											{
												"name": "A",
												"roleFlags": role.generateMask(...ARCHIVE_AND_RESTORE)
											}
										]
									}
								}
							}
						}
					}
				}
			}
		})
		const restoreBtn = wrapper.find(".restore-btn")
		await restoreBtn.trigger("click")
		await flushPromises()

		const castFetch = fetch as jest.Mock<any, any>
		const [ [ request ] ] = castFetch.mock.calls
		expect(request).toHaveProperty("method", "PATCH")
		expect(request).toHaveProperty("url", "/api/role")
	})
})
