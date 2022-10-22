import { shallowMount } from "@vue/test-utils"
import { faker } from "@faker-js/faker"
import Component from "./non-sensitive_text.vue"

describe("Component: fields/non-sensitive_text", () => {
	it("can update", async() => {
		const wrapper = shallowMount(Component, {
			"props": {
				"label": "E-mail",
				"modelValue": "",
				"required": true,
				"type": "email"
			}
		})
		const field = wrapper.find("input")
		const exampleEmail = faker.internet.exampleEmail()

		await field.setValue(exampleEmail)

		const updates = wrapper.emitted("update:modelValue") as string[]
		expect(updates).toHaveLength(1)
		expect(updates[0]).toEqual([ exampleEmail ])
	})

	it("should change upon prop update", async() => {
		const wrapper = shallowMount<any>(Component, {
			"props": {
				"label": "E-mail",
				"modelValue": "",
				"type": "email"
			}
		})

		const newValue = "admin@example.com"
		await wrapper.setProps({
			"label": "E-mail",
			"modelValue": newValue,
			"type": "email"
		})

		const field = wrapper.find("input").element as HTMLInputElement
		expect(field.value).toBe(newValue)
	})

	it("may be edited", async() => {
		const wrapper = shallowMount(Component, {
			"props": {
				"label": "E-mail",
				"modelValue": "",
				"required": true,
				"status": "locked",
				"type": "email"
			}
		})

		const editButton = wrapper.find("button")

		await editButton.trigger("click")

		const field = wrapper.find("input")
		expect(field.attributes("disabled")).toBe("")
		const updates = wrapper.emitted("update:status")
		expect(updates).toHaveLength(1)
		expect(updates).toHaveProperty("0.0", "unlocked")
	})

	it("may not be edited", async() => {
		const wrapper = shallowMount(Component, {
			"props": {
				"label": "E-mail",
				"modelValue": "",
				"required": true,
				"status": "unlocked",
				"type": "email"
			}
		})

		const editButton = wrapper.find("button")

		await editButton.trigger("click")

		const field = wrapper.find("input")
		expect(field.attributes("disabled")).toBeUndefined()
		const updates = wrapper.emitted("update:status")
		expect(updates).toHaveLength(1)
		expect(updates).toHaveProperty("0.0", "locked")
	})

	it("must be disabled", async() => {
		const wrapper = shallowMount(Component, {
			"props": {
				"label": "E-mail",
				"modelValue": "",
				"required": true,
				"status": "disabled",
				"type": "email"
			}
		})

		const field = wrapper.find("input")
		const editButton = wrapper.find("button")
		const doesExists = await editButton.exists()

		expect(field.attributes("disabled")).toBe("")
		expect(doesExists).toBeFalsy()
	})

	it("must be enabled", async() => {
		const wrapper = shallowMount(Component, {
			"props": {
				"label": "E-mail",
				"modelValue": "",
				"required": true,
				"status": "enabled",
				"type": "email"
			}
		})

		const field = wrapper.find("input")
		const editButton = wrapper.find("button")
		const doesExists = await editButton.exists()

		expect(field.attributes("disabled")).toBeFalsy()
		expect(doesExists).toBeFalsy()
	})

	it("may be saved implicitly", async() => {
		const wrapper = shallowMount(Component, {
			"props": {
				"label": "E-mail",
				"maySaveImplicitly": true,
				"modelValue": "",
				"required": true,
				"type": "email"
			}
		})

		const field = wrapper.find("input")
		await field.trigger("keyup.enter")

		expect(wrapper.emitted("saveImplicitly")).toHaveLength(1)
	})

	it("may not be saved implicitly", async() => {
		const wrapper = shallowMount(Component, {
			"props": {
				"label": "E-mail",
				"modelValue": "",
				"required": true,
				"type": "email"
			}
		})

		const field = wrapper.find("input")
		await field.trigger("keyup.enter")

		expect(wrapper.emitted("saveImplicitly")).not.toBeDefined()
	})
})
