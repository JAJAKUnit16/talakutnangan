import { nextTick, ref } from "vue"
import { shallowMount, flushPromises } from "@vue/test-utils"

import { BODY_CLASSES } from "$@/constants/provided_keys"
import { UPDATE_PASSWORD_LINK } from "$/constants/template_links"

import specializePath from "$/helpers/specialize_path"
import BodyCSSClasses from "$@/external/body_css_classes"
import RequestEnvironment from "$/singletons/request_environment"

import Component from "./update_password_field.vue"

describe("Component: settings/update_password_field", () => {
	it("can save user password", async() => {
		const CURRENT_PASSWORD = "Hello"
		const NEW_PASSWORD = "World"
		const CONFIRM_NEW_PASSWORD = "!"
		const userID = "1"
		fetchMock.mockResponseOnce("", { "status": RequestEnvironment.status.NO_CONTENT })
		const wrapper = shallowMount(Component, {
			"global": {
				"provide": {
					[BODY_CLASSES]: ref(new BodyCSSClasses([])),
					"pageContext": {
						"pageProps": {
							"userProfile": {
								"data": {
									"id": userID
								}
							}
						}
					}
				},
				"stubs": {
					"Overlay": false,
					"SensitiveTextField": false
				}
			}
		})

		const editButton = wrapper.find(".input-and-controls button")
		await editButton.trigger("click")

		const overlayInputs = wrapper.findAll(".overlay input")
		const [ currentInput, newInput, confirmationInput ] = overlayInputs
		const saveButton = wrapper.find(".overlay-footer button:nth-of-type(2)")
		await currentInput.setValue(CURRENT_PASSWORD)
		await newInput.setValue(NEW_PASSWORD)
		await confirmationInput.setValue(CONFIRM_NEW_PASSWORD)
		await saveButton.trigger("click")
		await flushPromises()
		await nextTick()

		const castFetch = fetch as jest.Mock<any, any>
		const [ [ firstRequest ] ] = castFetch.mock.calls
		expect(firstRequest).toHaveProperty("method", "PATCH")
		expect(firstRequest).toHaveProperty("url", specializePath(UPDATE_PASSWORD_LINK, {
			"id": userID
		}))
		const firstRequestBody = await firstRequest.json()
		expect(firstRequestBody).toHaveProperty("data.attributes.password", NEW_PASSWORD)
		expect(firstRequestBody).toHaveProperty("data.id", userID)
		expect(firstRequestBody).toHaveProperty("data.type", "user")
		expect(firstRequestBody).toHaveProperty("meta.confirmPassword", CONFIRM_NEW_PASSWORD)
		expect(firstRequestBody).toHaveProperty("meta.currentPassword", CURRENT_PASSWORD)
	})
})
