import { ref } from "vue"

import type { DeserializedDepartmentResource } from "$/types/documents/department"

import DepartmentFetcher from "$@/fetchers/department"
import RequestEnvironment from "$/singletons/request_environment"

import loadRemainingDepartments from "./load_remaining_departments"

describe("Helper: Load remaining departments", () => {
	it("should stop loop", async() => {
		fetchMock.mockResponseOnce(
			JSON.stringify({
				"data": [],
				"meta": {
					"count": 0
				}
			}),
			{ "status": RequestEnvironment.status.OK }
		)
		const fetcher = new DepartmentFetcher()
		const departments = ref<DeserializedDepartmentResource[]>([])

		await loadRemainingDepartments(departments, fetcher)

		expect(fetch).toHaveBeenCalledTimes(1)
	})
})
