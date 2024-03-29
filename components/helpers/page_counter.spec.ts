import { DEFAULT_LIST_LIMIT } from "$/constants/numerical"
import { shallowMount } from "@vue/test-utils"

import Component from "./page_counter.vue"

describe("Component: page counter", () => {
	it("can generate page count buttons by balanced count", () => {
		const wrapper = shallowMount(Component, {
			"props": {
				"maxResourceCount": 50,
				"modelValue": 0
			}
		})

		const pageCountBtns = wrapper.findAll(".page-count-btn")
		const expectedLength = 4
		expect(pageCountBtns.length).toEqual(expectedLength)
	})

	it("can generate page count buttons by imbalance count", () => {
		const wrapper = shallowMount(Component, {
			"props": {
				"maxResourceCount": 48,
				"modelValue": 0
			}
		})

		const pageCountBtns = wrapper.findAll(".page-count-btn")
		const expectedLength = 4
		expect(pageCountBtns.length).toEqual(expectedLength)
	})

	it("can not move to previous page", async() => {
		const wrapper = shallowMount(Component, {
			"props": {
				"maxResourceCount": 48,
				"modelValue": 0
			}
		})

		const previousBtn = wrapper.find(".previous-btn")
		await previousBtn.trigger("click")

		expect(wrapper.emitted()).not.toHaveProperty("update:modelValue")
	})

	it("can not move to next page", async() => {
		const wrapper = shallowMount(Component, {
			"props": {
				"maxResourceCount": 48,
				"modelValue": 40
			}
		})

		const nextBtn = wrapper.find(".next-btn")
		await nextBtn.trigger("click")

		expect(wrapper.emitted()).not.toHaveProperty("update:modelValue")
	})

	it("can emit custom events", () => {
		const wrapper = shallowMount(Component, {
			"props": {
				"maxResourceCount": 50,
				"modelValue": 0
			}
		})

		const pageBtns = wrapper.findAll(".page-count-btn")
		pageBtns.forEach(async btn => await btn.trigger("click"))

		const emissions = wrapper.emitted()
		const expectedProperty = "update:modelValue"
		const EXPECTED_PROPERTY_LENGTH = pageBtns.length
		expect(emissions).toHaveProperty(expectedProperty)
		expect(emissions[expectedProperty]).toHaveLength(EXPECTED_PROPERTY_LENGTH)
		emissions[expectedProperty].forEach((event: any, index) => {
			const offset = index * DEFAULT_LIST_LIMIT
			const [ emittedValue ] = event
			expect(emittedValue).toEqual(offset)
		})
	})
})
