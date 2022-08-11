import { JSON_API_MEDIA_TYPE } from "$/types/server"
import type { DepartmentQueryParameters } from "$/types/query"
import stringifyQuery from "$@/fetchers/stringify_query"
import RequestEnvironment from "$/helpers/request_environment"
import DepartmentFetcher from "./department"

describe("Communicator: Department", () => {
	it("can create resource", async () => {
		fetchMock.mockResponseOnce(JSON.stringify({
			data: {
				type: "department",
				id: 1,
				attributes: {
					fullName: "A",
					acronym: "A",
					mayAdmit: true
				}
			}
		}), { status: RequestEnvironment.status.CREATED })

		const fetcher = new DepartmentFetcher()
		const response = await fetcher.create({
			fullName: "A",
			acronym: "A",
			mayAdmit: true
		})

		const request = (fetch as jest.Mock<any, any>).mock.calls[0][0]
		expect(request).toHaveProperty("method", "POST")
		expect(request).toHaveProperty("url", "/api/department")
		expect(request.json()).resolves.toStrictEqual({
			data: {
				type: "department",
				attributes: {
					fullName: "A",
					acronym: "A",
					mayAdmit: true
				}
			}
		})
		expect(response).toHaveProperty("body", {
			data: {
				type: "department",
				id: 1,
				fullName: "A",
				acronym: "A",
				mayAdmit: true
			}
		})
		expect(response).toHaveProperty("status", RequestEnvironment.status.CREATED)
	})

	it("can list all resources", async () => {
		fetchMock.mockResponseOnce(JSON.stringify({
			data: [
				{
					type: "department",
					fullName: "A",
					acronym: "A",
					mayAdmit: true
				}
			]
		}),
		{ status: RequestEnvironment.status.OK })

		const queryObject: DepartmentQueryParameters = {
			filter: {
				existence: "exists",
				IDs: []
			},
			sort: [ "id", "name" ],
			page: {
				offset: 0,
				limit: 5
			}
		}
		const fetcher = new DepartmentFetcher()
		const response = await fetcher.list(queryObject)

		const request = (fetch as jest.Mock<any, any>).mock.calls[0][0]
		expect(request).toHaveProperty("method", "GET")
		expect(request).toHaveProperty("url", "/api/department?"+stringifyQuery({
			...queryObject,
			sort: queryObject.sort.join(",")
		}))
		expect(request.headers.get("Content-Type")).toBe(JSON_API_MEDIA_TYPE)
		expect(request.headers.get("Accept")).toBe(JSON_API_MEDIA_TYPE)
		expect(response).toHaveProperty("body.data.0.type")
		expect(response).toHaveProperty("status", RequestEnvironment.status.OK)
	})

	it("can update resource", async () => {
		fetchMock.mockResponseOnce("", { status: RequestEnvironment.status.NO_CONTENT })

		const fetcher = new DepartmentFetcher()
		const response = await fetcher.update(1, {
			fullName: "A",
			acronym: "A",
			mayAdmit: true
		})

		const request = (fetch as jest.Mock<any, any>).mock.calls[0][0]
		expect(request).toHaveProperty("method", "PATCH")
		expect(request).toHaveProperty("url", "/api/department/1")
		expect(request.headers.get("Content-Type")).toBe(JSON_API_MEDIA_TYPE)
		expect(request.headers.get("Accept")).toBe(JSON_API_MEDIA_TYPE)
		expect(request.json()).resolves.toStrictEqual({
			data: {
				type: "department",
				id: 1,
				attributes: {
					fullName: "A",
					acronym: "A",
					mayAdmit: true
				}
			}
		})
		expect(response).toHaveProperty("body", null)
		expect(response).toHaveProperty("status", RequestEnvironment.status.NO_CONTENT)
	})

	it("can archive resource", async () => {
		fetchMock.mockResponseOnce("", { status: RequestEnvironment.status.NO_CONTENT })

		const fetcher = new DepartmentFetcher()
		const response = await fetcher.archive([ 1 ])

		const request = (fetch as jest.Mock<any, any>).mock.calls[0][0]
		expect(request).toHaveProperty("method", "DELETE")
		expect(request).toHaveProperty("url", "/api/department")
		expect(request.headers.get("Content-Type")).toBe(JSON_API_MEDIA_TYPE)
		expect(request.headers.get("Accept")).toBe(JSON_API_MEDIA_TYPE)
		expect(request.json()).resolves.toStrictEqual({
			data: [
				{ type: "department", id: 1 }
			]
		})
		expect(response).toHaveProperty("body", null)
		expect(response).toHaveProperty("status", RequestEnvironment.status.NO_CONTENT)
	})

	it("can restore resource", async () => {
		fetchMock.mockResponseOnce("", { status: RequestEnvironment.status.NO_CONTENT })

		const fetcher = new DepartmentFetcher()
		const response = await fetcher.restore([ 2 ])

		const request = (fetch as jest.Mock<any, any>).mock.calls[0][0]
		expect(request).toHaveProperty("method", "PATCH")
		expect(request).toHaveProperty("url", "/api/department")
		expect(request.headers.get("Content-Type")).toBe(JSON_API_MEDIA_TYPE)
		expect(request.headers.get("Accept")).toBe(JSON_API_MEDIA_TYPE)
		expect(request.json()).resolves.toStrictEqual({
			data: [
				{ type: "department", id: 2 }
			]
		})
		expect(response).toHaveProperty("body", null)
		expect(response).toHaveProperty("status", RequestEnvironment.status.NO_CONTENT)
	})
})
