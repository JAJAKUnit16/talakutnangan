import User from "%/models/user"
import UserFactory from "~/factories/user"

import siftBySlug from "./sift_by_slug"

describe("Database Pipe: Sift by slug", () => {
	it("can find all", async () => {
		const user = await new UserFactory().insertOne()
		const slug = ""

		const options = siftBySlug({}, { filter: { slug } })
		const foundUsers = await User.findAll(options)

		expect(options).not.toHaveProperty("include")
		expect(foundUsers).toHaveLength(1)
		expect(foundUsers).toHaveProperty("0.id", user.id)
	})

	it("can find on specific using name", async () => {
		const user = await new UserFactory().name(() => "alice").insertOne()
		const otherUser = await new UserFactory().name(() => "bob").insertOne()
		const slug = "ali"

		const options = siftBySlug({}, { filter: { slug } })
		const foundUsers = await User.findAll(options)

		expect(options).toHaveProperty("where")
		expect(foundUsers).toHaveLength(1)
		expect(foundUsers).toHaveProperty("0.id", user.id)
	})

	it("can find on specific using email", async () => {
		const user = await new UserFactory().email(() => "alice@example.com").insertOne()
		const otherUser = await new UserFactory().email(() => "bob@example.com").insertOne()
		const slug = "bob@example"

		const options = siftBySlug({}, { filter: { slug } })
		const foundUsers = await User.findAll(options)

		expect(options).toHaveProperty("where")
		expect(foundUsers).toHaveLength(1)
		expect(foundUsers).toHaveProperty("0.id", otherUser.id)
	})

	it("cannot find on incorrect slug", async () => {
		const user = await new UserFactory()
			.name(() => "alice")
			.email(() => "alice@example.com")
			.insertOne()
		const otherUser = await new UserFactory()
			.name(() => "bob")
			.email(() => "bob@example.com")
			.insertOne()
		const slug = "xx"

		const options = siftBySlug({}, { filter: { slug } })
		const foundUsers = await User.findAll(options)

		expect(options).toHaveProperty("where")
		expect(foundUsers).toHaveLength(0)
	})
})
