import { mount } from "@vue/test-utils"
import Dropdown from "./Dropdown.vue"


describe("Component: Dropdown", () => {
	it("Should close if click emitted outside of dropdown", async () => {
		const wrapper = mount(Dropdown, {
			props: {
				purpose: ""
			}
		})
		const toggler = wrapper.find("#dropdown-btn")
		await toggler.trigger("click")
		const invisibleCloser = wrapper.find(".invisible-closer")
		await invisibleCloser.trigger("click")

		expect(wrapper.emitted()).toHaveProperty("click")
	})
})
