import { faker } from "@faker-js/faker"
import { mount } from "@vue/test-utils"

import type { DeserializedUserProfile } from "$/types/documents/user"

import Factory from "~/factories/user"
import StudentDetailFactory from "~/factories/student_detail"
import RequestEnvironment from "$/singletons/request_environment"

import Page from "./account.page.vue"

describe("Page: settings/account", () => {
	it("should show basic details for students", async() => {
		const factory = new Factory()
		const userProfileModel = await factory.beStudent().insertOne()
		const studentDetailModel = await new StudentDetailFactory()
		.user(() => Promise.resolve(userProfileModel))
		.insertOne()
		userProfileModel.studentDetail = studentDetailModel
		const userProfileResource = await factory
		.deserialize(userProfileModel) as DeserializedUserProfile<"department"|"studentDetail">
		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							"userProfile": userProfileResource
						}
					}
				}
			}
		})

		const inputs = wrapper.findAll("input")

		expect(inputs).toHaveLength(4)
		expect(inputs[0].element.value).toBe(userProfileResource.data.email)
		expect(inputs[2].element.value).toBe(
			userProfileResource.data.studentDetail.data.studentNumber
		)
		expect(inputs[3].element.value).toBe(userProfileResource.data.department.data.acronym)
	})

	it("should show basic details for employees", async() => {
		const factory = new Factory()
		const userProfileModel = await factory.beReachableEmployee().insertOne()
		const userProfileResource = await factory
		.deserialize(userProfileModel) as DeserializedUserProfile<"department">
		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							"userProfile": userProfileResource
						}
					}
				}
			}
		})

		const inputs = wrapper.findAll("input")

		expect(inputs).toHaveLength(3)
		expect(inputs[0].element.value).toBe(userProfileResource.data.email)
		expect(inputs[2].element.value).toBe(userProfileResource.data.department.data.acronym)
	})

	it("should send updated user", async() => {
		fetchMock.mockResponseOnce("", { "status": RequestEnvironment.status.NO_CONTENT })
		const userProfile = await new Factory()
		.beUnreachableEmployee()
		.deserializedOne(true) as DeserializedUserProfile
		const fakeNewEmail = faker.internet.exampleEmail()
		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							userProfile
						}
					}
				}
			}
		})

		const editEmailFieldButton = wrapper.find("input[type=email] + .edit-button")
		await editEmailFieldButton.trigger("click")
		const emailField = wrapper.find("input[type=email]")
		await emailField.setValue(fakeNewEmail)
		const saveEmailFieldButton = wrapper.find("input[type=email] + .save-button")
		await saveEmailFieldButton.trigger("click")

		const castFetch = fetch as jest.Mock<any, any>
		const [ [ firstRequest ] ] = castFetch.mock.calls
		expect(firstRequest).toHaveProperty("method", "PATCH")
		expect(firstRequest).toHaveProperty("url", `/api/user/${userProfile.data.id}`)
		const firstRequestBody = await firstRequest.json()
		expect(firstRequestBody).toHaveProperty("data.attributes.email", fakeNewEmail)
		expect(firstRequestBody).toHaveProperty("data.id", userProfile.data.id)
		expect(firstRequestBody).toHaveProperty("data.type", "user")
	})
})
