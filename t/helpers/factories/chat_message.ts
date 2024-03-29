
import type { ModelCtor } from "%/types/dependent"
import type { GeneratedData } from "~/types/dependent"
import type { Message, TextMessage } from "$/types/message"
import type {
	ChatMessageResourceIdentifier,
	ChatMessageAttributes,
	DeserializedChatMessageResource,
	DeserializedChatMessageDocument,
	DeserializedChatMessageListDocument,
	ChatMessageResource,
	ChatMessageDocument,
	ChatMessageListDocument
} from "$/types/documents/chat_message"

import { faker } from "@faker-js/faker"

import User from "%/models/user"
import BaseFactory from "~/factories/base"
import Consultation from "%/models/consultation"
import ChatMessage from "%/models/chat_message"
import { chatMessageKind } from "$!/constants/regex"
import ChatMessageActivity from "%/models/chat_message_activity"
import ChatMessageTransformer from "%/transformers/chat_message"
import ChatMessageActivityFactory from "~/factories/chat_message_activity"

export default class ChatMessageFactory extends BaseFactory<
	ChatMessage,
	ChatMessageResourceIdentifier<"read">,
	ChatMessageAttributes<"serialized">,
	ChatMessageAttributes<"deserialized">,
	ChatMessageResource,
	DeserializedChatMessageResource,
	ChatMessageDocument,
	ChatMessageListDocument,
	DeserializedChatMessageDocument,
	DeserializedChatMessageListDocument
> {
	#chatMessageActivityGenerator: () => Promise<ChatMessageActivity>
		= async() => await new ChatMessageActivityFactory().insertOne()

	#kindGenerator: () => string = () => {
		const rawKind = faker.word.adjective().split("").filter(character => {
			const isValid = chatMessageKind.test(character)
			return isValid
		}).join("").repeat(2)

		const MAX_CHARACTERS = 255
		return rawKind.substring(0, Math.min(rawKind.length, MAX_CHARACTERS))
	}

	#dataGenerator: () => Message["data"] = () => ({
		"value": faker.lorem.sentence()
	} as TextMessage["data"])

	get model(): ModelCtor<ChatMessage> { return ChatMessage }

	get transformer(): ChatMessageTransformer { return new ChatMessageTransformer() }

	async generate(): GeneratedData<ChatMessage> {
		return {
			"chatMessageActivityID": (await this.#chatMessageActivityGenerator()).id,
			"data": this.#dataGenerator(),
			"kind": this.#kindGenerator()
		}
	}

	async attachRelatedModels(model: ChatMessage): Promise<ChatMessage> {
		model.chatMessageActivity = await ChatMessageActivity
		.findByPk(
			model.chatMessageActivityID,
			{
				"include": [ User, Consultation ]
			}
		) as ChatMessageActivity

		return model
	}

	data(generator: () => Message["data"]): ChatMessageFactory {
		this.#dataGenerator = generator
		return this
	}

	kind(generator: () => string): ChatMessageFactory {
		this.#kindGenerator = generator
		return this
	}

	chatMessageActivity(generator: () => Promise<ChatMessageActivity>): ChatMessageFactory {
		this.#chatMessageActivityGenerator = generator
		return this
	}
}
