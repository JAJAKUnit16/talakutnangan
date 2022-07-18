import "~/set-ups/email.set_up"
import MockRequester from "~/set-ups/mock_requester"

import type { PreprocessedRequest } from "!/types/dependent"
import type { NewUserNotificationArguments } from "!/types/independent"

import Transport from "!/helpers/email/transport"

import NewUserNotification from "./new_user_notification"

describe.skip("Middleware: New User Notifier", () => {
	const requester  = new MockRequester<PreprocessedRequest<NewUserNotificationArguments>>()

	it("can notify to multiple users", async () => {
		const sender = new NewUserNotification()
		requester.customizeRequest({
			protocol: "http",
			hostname: "localhost",
			nextMiddlewareArguments: <NewUserNotificationArguments>{
				userDetails: [
					{
						email: "sampleA@example.com",
						kind: "student",
						name: "Sample A",
						password: "12345678"
					},
					{
						email: "sampleB@example.net",
						kind: "student",
						name: "Sample B",
						password: "abcdefgh"
					}
				]
			}
		})

		await requester.runMiddleware(sender.intermediate.bind(sender))

		requester.expectSuccess()
		const previousMessages = Transport.consumePreviousMessages()
		expect(previousMessages).toHaveLength(2)
		expect(previousMessages[0]).toHaveProperty("message")
		expect(previousMessages[0]).toHaveProperty("message.subject", "New User in Talakutnangan")
		expect(previousMessages[0].message.text).toContain("Sample A")
		expect(previousMessages[0].message.text).toContain("sampleA@example.com")
		expect(previousMessages[0].message.text).toContain("student")
		expect(previousMessages[0].message.text).toContain("12345678")
		expect(previousMessages[0].message.html).toContain("Sample A")
		expect(previousMessages[0].message.html).toContain("sampleA@example.com")
		expect(previousMessages[0].message.html).toContain("student")
		expect(previousMessages[0].message.html).toContain("12345678")
		expect(previousMessages[1].message.text).toContain("Sample B")
		expect(previousMessages[1].message.text).toContain("sampleB@example.net")
		expect(previousMessages[1].message.text).toContain("student")
		expect(previousMessages[1].message.text).toContain("abcdefgh")
		expect(previousMessages[1].message.html).toContain("Sample B")
		expect(previousMessages[1].message.html).toContain("sampleB@example.net")
		expect(previousMessages[1].message.html).toContain("student")
		expect(previousMessages[1].message.html).toContain("abcdefgh")
	})
})
