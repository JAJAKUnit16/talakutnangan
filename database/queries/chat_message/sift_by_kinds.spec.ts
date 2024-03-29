import type { Message } from "$/types/message"

import Model from "%/models/chat_message"
import Factory from "~/factories/chat_message"

import siftByKind from "./sift_by_kinds"

describe("Database Pipe: Sift by kinds", () => {
	it("can find all models", async() => {
		const model = await new Factory().insertOne()

		const options = siftByKind({}, {
			"filter": {
				"chatMessageKinds": "*"
			}
		})
		const foundModels = await Model.findAll(options)

		expect(foundModels).toHaveLength(1)
		expect(foundModels).toHaveProperty("0.id", model.id)
	})

	it("can find on specific model", async() => {
		const model = await new Factory().insertOne()

		const options = siftByKind({}, {
			"filter": {
				"chatMessageKinds": [ model.kind ] as Message["kind"][]
			}
		})
		const foundModels = await Model.findAll(options)

		expect(options).toHaveProperty("where")
		expect(foundModels).toHaveLength(1)
		expect(foundModels).toHaveProperty("0.id", model.id)
	})

	it("cannot find on specific model", async() => {
		const model = await new Factory().insertOne()

		const options = siftByKind({}, {
			"filter": {
				// Repeat the kind name so there will be no match
				"chatMessageKinds": [ model.kind + model.kind ] as Message["kind"][]
			}
		})
		const foundModels = await Model.findAll(options)

		expect(options).toHaveProperty("where")
		expect(foundModels).toHaveLength(0)
	})
})
