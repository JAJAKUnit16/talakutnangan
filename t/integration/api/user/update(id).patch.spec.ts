import flushPromises from "flush-promises"
import { MULTIPART_MEDIA_TYPE, JSON_API_MEDIA_TYPE } from "$/types/server"
import RequestEnvironment from "$!/singletons/request_environment"

import "~/set-ups/email.set_up"
import App from "~/set-ups/app"
import UserFactory from "~/factories/user"
import RoleFactory from "~/factories/role"

import User from "%/models/user"
import Transport from "!/helpers/email/transport"
import Route from "!%/api/user/update(id).patch"
import { user as permissionGroup } from "$/permissions/permission_list"
import { UPDATE_OWN_DATA } from "$/permissions/user_combinations"

describe("PATCH /api/user/:id", () => {
	beforeAll(async () => {
		await App.create(new Route())
	})

	it("can be accessed by student and update own e-mail", async () => {
		const studentRole = await new RoleFactory()
			.userFlags(permissionGroup.generateMask(...UPDATE_OWN_DATA))
			.insertOne()

		const { user: student, cookie } = await App.makeAuthenticatedCookie(studentRole)
		const newStudent = await new UserFactory().makeOne()

		const response = await App.request
			.patch(`/api/user/${student.id}`)
			.set("Cookie", cookie)
			.send({
				data: {
					type: "user",
					id: student.id,
					attributes: {
						name: student.name,
						email: newStudent.email,
						prefersDark: newStudent.prefersDark
					}
				}
			})
			.type(JSON_API_MEDIA_TYPE)
			.accept(JSON_API_MEDIA_TYPE)

		expect(response.statusCode).toBe(RequestEnvironment.status.NO_CONTENT)

		const updatedStudent = await User.findOne({ where: { id: student.id }})
		expect(updatedStudent!.emailVerifiedAt).toBeNull()

		await flushPromises() // Middleware intermediate runs
		await flushPromises() // Intermediate promise
		await flushPromises() // Make temporary URL
		await flushPromises() // Make encrypted URL
		await flushPromises() // Make encrypted path
		await flushPromises() // Encrypt
		await flushPromises() // Import `crypto` module
		await flushPromises() // Generate key
		await flushPromises() // E-mail template read
		await flushPromises() // E-mail message transmission
		await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for complete transmission
		const previousMessages = Transport.consumePreviousMessages()
		expect(previousMessages).toHaveLength(1)
		expect(previousMessages[0]).toHaveProperty("message")
		expect(previousMessages[0]).toHaveProperty("message.subject", "Email Verification")
		expect(previousMessages[0].message.text).toContain(updatedStudent!.email)
		expect(previousMessages[0].message.text).toContain("/user/verify")
	})

	it("can be accessed by student and retain email verification after update", async () => {
		const studentRole = await new RoleFactory()
			.userFlags(permissionGroup.generateMask(...UPDATE_OWN_DATA))
			.insertOne()

		const { user: student, cookie } = await App.makeAuthenticatedCookie(studentRole)
		const newStudent = await new UserFactory().prefersDark(() => true).makeOne()

		const response = await App.request
			.patch(`/api/user/${student.id}`)
			.set("Cookie", cookie)
			.send({
				data: {
					type: "user",
					id: student.id,
					attributes: {
						name: newStudent.name,
						email: student.email,
						prefersDark: newStudent.prefersDark
					}
				}
			})
			.type(JSON_API_MEDIA_TYPE)
			.accept(JSON_API_MEDIA_TYPE)

		console.log(response.body)
		expect(response.statusCode).toBe(RequestEnvironment.status.NO_CONTENT)

		const updatedStudent = await User.findOne({ where: { id: student.id }})
		expect(updatedStudent!.emailVerifiedAt).toStrictEqual(student.emailVerifiedAt)
		expect(updatedStudent!.name).toBe(newStudent.name)
		expect(updatedStudent!.prefersDark).toBe(newStudent.prefersDark)
	})
})
