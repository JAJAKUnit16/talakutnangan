import RoleFactory from "~/factories/role"
import UserFactory from "~/factories/user"

import RoleManager from "./role"

describe("Database: Role read operations", () => {
	it("can count single role", async () => {
		const manager = new RoleManager()
		const role = await new RoleFactory().insertOne()
		await new UserFactory().attach(role).insertOne()
		await new UserFactory().attach(role).insertOne()

		const counts = await manager.countUsers([ role.id ])

		expect(counts).toHaveProperty("data.0.id", String(role.id))
		expect(counts).toHaveProperty("data.0.type", "role")
		expect(counts).toHaveProperty("data.0.meta.userCount", 2)
	})

	it("can count single role with zero users", async () => {
		const manager = new RoleManager()
		const role = await new RoleFactory().insertOne()

		const counts = await manager.countUsers([ role.id ])

		expect(counts).toHaveProperty("data.0.id", String(role.id))
		expect(counts).toHaveProperty("data.0.type", "role")
		expect(counts).toHaveProperty("data.0.meta.userCount", 0)
	})

	it("can count multiple roles", async () => {
		const manager = new RoleManager()
		const roleA = await new RoleFactory().insertOne()
		const roleB = await new RoleFactory().insertOne()
		await new UserFactory().attach(roleA).insertOne()
		await new UserFactory().attach(roleA).insertOne()
		await new UserFactory().attach(roleA).insertOne()
		await new UserFactory().attach(roleB).insertOne()
		await new UserFactory().attach(roleB).insertOne()

		const counts = await manager.countUsers([ roleA.id, roleB.id ])

		expect(counts).toHaveProperty("data.0.id", String(roleA.id))
		expect(counts).toHaveProperty("data.0.type", "role")
		expect(counts).toHaveProperty("data.0.meta.userCount", 3)
		expect(counts).toHaveProperty("data.1.id", String(roleB.id))
		expect(counts).toHaveProperty("data.1.type", "role")
		expect(counts).toHaveProperty("data.1.meta.userCount", 2)
	})
})
