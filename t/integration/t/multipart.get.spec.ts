import RequestEnvironment from "!/helpers/request_environment"

import App from "~/set-ups/app"

import Route from "!/app/routes/t/multipart.post"

describe("GET /t/multipart", () => {
	beforeAll(async () => {
		await App.create(new Route(), false)
	})

	it("can upload multipart form data", async () => {
		const path = `${RequestEnvironment.root}/t/data/valid_student_details.csv`

		const response = await App.request
			.post("/t/multipart")
			.attach("importedCSV", path)

		expect(response.statusCode).toBe(RequestEnvironment.status.OK)
		expect(response.body).toHaveProperty("importedCSV")
		expect(response.body.importedCSV).toHaveProperty("buffer")
		expect(response.body.importedCSV).toHaveProperty("info")
	})

	it("can upload multipart form data with array", async () => {
		const path = `${RequestEnvironment.root}/t/data/valid_student_details.csv`

		const response = await App.request
			.post("/t/multipart")
			.field("roles[]", [ "a", "b" ])
			.attach("importedCSV", path)

		expect(response.statusCode).toBe(RequestEnvironment.status.OK)
		expect(response.body).toHaveProperty("roles")
		expect(response.body.roles).toStrictEqual([ "a", "b" ])
		expect(response.body).toHaveProperty("importedCSV")
		expect(response.body.importedCSV).toHaveProperty("buffer")
		expect(response.body.importedCSV).toHaveProperty("info")
	})
})
