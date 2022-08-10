import { JSON_API_MEDIA_TYPE } from "$/types/server"

import App from "~/set-ups/app"
import RoleFactory from "~/factories/role"
import AuditTrailFactory from "~/factories/audit_trail"

import { READ } from "$/permissions/audit_trail_combinations"
import RequestEnvironment from "$!/singletons/request_environment"
import { auditTrail as permissionGroup } from "$/permissions/permission_list"

import Route from "!%/api/audit_trail/list.get"

describe("GET /api/audit_trail", () => {
	beforeAll(async () => {
		await App.create(new Route())
	})

	it("can be accessed by permitted user and get audit trails", async () => {
		const anyRole = await new RoleFactory()
			.auditTrailFlags(permissionGroup.generateMask(...READ))
			.insertOne()
		const auditTrails = (await (new AuditTrailFactory()).insertMany(3)).sort((a, b) => {
			return a.id === b.id ? 0 : a.id < b.id ? -1 : 1
		})
		const { user: admin, cookie } = await App.makeAuthenticatedCookie(anyRole)

		const response = await App.request
			.get("/api/audit_trail")
			.query({ sort: "id" })
			.set("Cookie", cookie)
			.type(JSON_API_MEDIA_TYPE)
			.accept(JSON_API_MEDIA_TYPE)

		expect(response.statusCode).toBe(RequestEnvironment.status.OK)
		expect(response.body).toHaveProperty("data.0.type", "audit_trail")
		expect(response.body).toHaveProperty(
			"data.0.attributes.actionName",
			auditTrails[0].actionName)
		expect(response.body).toHaveProperty(
			"data.1.attributes.actionName",
			auditTrails[1].actionName)
		expect(response.body).toHaveProperty(
			"data.2.attributes.actionName",
			auditTrails[2].actionName)
	})

	it("can be accessed by permitted user but get audit_trails in descending order", async () => {
		const anyRole = await new RoleFactory()
			.auditTrailFlags(permissionGroup.generateMask(...READ))
			.insertOne()
		const auditTrails = (await (new AuditTrailFactory()).insertMany(3)).sort((a, b) => {
			return a.actionName.localeCompare(b.actionName)
		})
		const { user: admin, cookie } = await App.makeAuthenticatedCookie(anyRole)

		const response = await App.request
			.get("/api/audit_trail")
			.query({ sort: "-actionName" })
			.set("Cookie", cookie)
			.type(JSON_API_MEDIA_TYPE)
			.accept(JSON_API_MEDIA_TYPE)

		expect(response.statusCode).toBe(RequestEnvironment.status.OK)
		expect(response.body).toHaveProperty("data.0.type", "audit_trail")
		expect(response.body).toHaveProperty(
			"data.0.attributes.actionName",
			auditTrails[2].actionName)
		expect(response.body).toHaveProperty(
			"data.1.attributes.actionName",
			auditTrails[1].actionName)
		expect(response.body).toHaveProperty(
			"data.2.attributes.actionName",
			auditTrails[0].actionName)
	})
})
