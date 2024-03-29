import makeTemplateLink from "./make_template_link"

describe("Helper: Make link", () => {
	it("can make links", () => {
		const prefix = "/api/v1"
		const type = "user"

		const { bound, unbound, query } = makeTemplateLink(prefix, type)

		expect(type).toBe(type)
		expect(bound).toBe(`${prefix}/${type}/:id`)
		expect(unbound).toBe(`${prefix}/${type}`)
		expect(query).toBe(`${prefix}/${type}?:query`)
	})
})
