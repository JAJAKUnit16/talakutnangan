import type { FieldRules } from "!/types/validation"
import type { ChatMessageDocument } from "$/types/documents/chat_message"
import type { Request, Response, BaseManagerClass } from "!/types/dependent"

import { chatMessageKind, chatMessageKindDescription } from "$!/constants/regex"

import Socket from "!/ws/socket"
import Log from "$!/singletons/log"
import Manager from "%/managers/chat_message"
import JSONController from "!/controllers/json"
import CreatedResponseInfo from "!/response_infos/created"
import ChatMessageActivityManager from "%/managers/chat_message_activity"
import makeConsultationChatNamespace from "$/namespace_makers/consultation_chat"

import Policy from "!/bases/policy"
import CommonMiddlewareList from "!/middlewares/common_middleware_list"

import string from "!/validators/base/string"
import exists from "!/validators/manager/exists"
import regex from "!/validators/comparison/regex"
import required from "!/validators/base/required"
import length from "!/validators/comparison/length"
import anyObject from "!/validators/base/any_object"
import makeRelationshipRules from "!/rule_sets/make_relationships"
import makeResourceDocumentRules from "!/rule_sets/make_resource_document"
import doesBelongToCurrentUser from "!/validators/manager/does_belong_to_current_user"

export default class extends JSONController {
	get filePath(): string { return __filename }

	get policy(): Policy {
		return CommonMiddlewareList.consultationParticipantsOnlyPolicy
	}

	makeBodyRuleGenerator(unusedRequest: Request): FieldRules {
		const attributes: FieldRules = {
			"data": {
				"pipes": [ required, anyObject ]
			},
			"kind": {
				"constraints": {
					"length": {
						"maximum": 255,
						"minimum": 3
					},
					"regex": {
						"friendlyDescription": chatMessageKindDescription,
						"match": chatMessageKind
					}
				},
				"pipes": [ required, string, length, regex ]
			}
		}

		const relationships: FieldRules = makeRelationshipRules([
			{
				"ClassName": ChatMessageActivityManager,
				"isArray": false,
				"options": {
					"postIDRules": {
						"pipes": [ doesBelongToCurrentUser ]
					}
				},
				"relationshipName": "chatMessageActivity",
				"typeName": "chat_message_activity",
				"validator": exists
			}
		])

		return makeResourceDocumentRules("chat_message", attributes, {
			"extraDataQueries": relationships,
			"isNew": true
		})
	}

	get manager(): BaseManagerClass { return Manager }

	async handle(request: Request, unusedResponse: Response): Promise<CreatedResponseInfo> {
		const manager = new Manager(request)
		const { data } = request.body as ChatMessageDocument<"create">
		const { attributes, relationships } = data
		const chatMessageActivityID = Number(relationships.chatMessageActivity.data.id)

		const document = await manager.create({
			...attributes,
			chatMessageActivityID
		}) as ChatMessageDocument<"create">

		Socket.emitToClients(
			makeConsultationChatNamespace(document.data.relationships.consultation.data.id),
			"create",
			document
		)

		Log.success("controller", "successfully created the chat message of the user")

		return new CreatedResponseInfo(document)
	}
}
