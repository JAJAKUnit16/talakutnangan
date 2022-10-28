import type { Rules, FieldRules } from "!/types/validation"
import type { DeserializedUserProfile } from "$/types/documents/user"
import type { ConsultationDocument } from "$/types/documents/consultation"
import type { AuthenticatedIDRequest, Response, BaseManagerClass } from "!/types/dependent"

import { consultationReason, consultationReasonDescription } from "$!/constants/regex"

import Socket from "!/ws/socket"
import Policy from "!/bases/policy"
import UserManager from "%/managers/user"
import Manager from "%/managers/consultation"
import deserialize from "$/object/deserialize"
import Merger from "!/middlewares/miscellaneous/merger"
import ChatMessageManager from "%/managers/chat_message"
import NoContentResponseInfo from "!/response_infos/no_content"
import DoubleBoundJSONController from "!/controllers/double_bound_json"
import makeConsultationNamespace from "$/namespace_makers/consultation"
import ChatMessageActivityManager from "%/managers/chat_message_activity"
import makeConsultationChatNamespace from "$/namespace_makers/consultation_chat"

import CommonMiddlewareList from "!/middlewares/common_middleware_list"
import BelongsToCurrentUserPolicy from "!/policies/belongs_to_current_user"

import or from "!/validators/logical/or"
import date from "!/validators/base/date"
import object from "!/validators/base/object"
import string from "!/validators/base/string"
import boolean from "!/validators/base/boolean"
import same from "!/validators/comparison/same"
import required from "!/validators/base/required"
import nullable from "!/validators/base/nullable"
import regex from "!/validators/comparison/regex"
import length from "!/validators/comparison/length"
import isLessThan from "!/validators/comparison/is_less_than"
import makeRelationshipRules from "!/rule_sets/make_relationships"
import makeResourceDocumentRules from "!/rule_sets/make_resource_document"
import existWithSameAttribute from "!/validators/manager/exist_with_same_attribute"
import uniqueConsultationSchedule from "!/validators/date/unique_consultation_schedule"
import isWithinEmployeeSchedule from "!/validators/manager/is_within_employee_schedule"
import hasNoOtherActiveConsultation from "!/validators/manager/has_no_other_active_consultation"

export default class extends DoubleBoundJSONController {
	get filePath(): string { return __filename }

	get policy(): Policy {
		return new Merger([
			CommonMiddlewareList.consultationParticipantsOnlyPolicy,
			new BelongsToCurrentUserPolicy(this.manager)
		]) as unknown as Policy
	}

	makeBodyRuleGenerator(unusedRequest: AuthenticatedIDRequest): FieldRules {
		const pureNull: Rules = {
			"constraints": {
				"nullable": {
					"defaultValue": null
				},
				"same": {
					"value": null
				}
			},
			"pipes": [ nullable, same ]
		}

		const pureDate: Rules = {
			"pipes": [ required, string, date ]
		}

		const correctStartDate: Rules = {
			"constraints": {
				"isLessThan": {
					"pointer": "data.attributes.finishedAt"
				}
			},
			"pipes": [ ...pureDate.pipes, isLessThan ]
		}

		const attributes: FieldRules = {
			"actionTaken": {
				"constraints": {
					"or": {
						"rules": [
							{
								"constraints": {
									"length": {
										"maximum": 255,
										"minimum": 10
									}
								},
								"friendlyName": "action taken",
								"pipes": [ required, string, length ]
							},
							{
								...pureNull,
								"friendlyName": "action taken"
							}
						]
					}
				},
				"friendlyName": "action taken",
				"pipes": [ or ]
			},
			"finishedAt": {
				"constraints": {
					"or": {
						"rules": [ pureDate, pureNull ]
					}
				},
				"pipes": [ or ]
			},
			"reason": {
				"constraints": {
					"length": {
						"maximum": 100,
						"minimum": 10
					},
					"regex": {
						"friendlyDescription": consultationReasonDescription,
						"match": consultationReason
					}
				},
				"pipes": [ required, string, length, regex ]
			},
			"scheduledStartAt": {
				"constraints": {
					"isLessThan": {
						"pointer": "data.attributes.startedAt"
					},
					"isWithinEmployeeSchedule": {
						"userIDPointer": "data.relationships.consultant.data.id"
					},
					"uniqueConsultationSchedule": {
						"conflictConfirmationPointer": "meta.doesAllowConflicts",
						"userIDPointer": "data.relationships.consultant.data.id"
					}
				},
				"pipes": [
					required,
					string,
					date,
					isLessThan,
					isWithinEmployeeSchedule,
					uniqueConsultationSchedule
				]
			},
			"startedAt": {
				"constraints": {
					"or": {
						"rules": [ correctStartDate, pureNull ]
					}
				},
				"pipes": [ or ]
			}
		}

		const relationships: FieldRules = makeRelationshipRules([
			{
				"ClassName": UserManager,
				"isArray": false,
				"options": {
					"postIDRules": {
						"constraints": {
							"sameAttribute": {
								"columnName": "kind",
								"value": "reachable_employee"
							}
						},
						"pipes": []
					}
				},
				"relationshipName": "consultant",
				"typeName": "user",
				"validator": existWithSameAttribute
			}
		])

		const meta: FieldRules = {
			"meta": {
				"constraints": {
					"object": {
						"doesAllowConflicts": {
							"constraints": {
								"boolean": {
									"loose": false
								}
							},
							"pipes": [ required, boolean ]
						}
					}
				},
				"pipes": [ required, object ]
			}
		}

		return makeResourceDocumentRules(
			"consultation",
			attributes,
			{
				"extraDataQueries": relationships,
				"extraQueries": meta,
				"isNew": false,
				"mustCastID": false,
				"postIDRules": {
					"pipes": [ hasNoOtherActiveConsultation ]
				}
			}
		)
	}

	get manager(): BaseManagerClass { return Manager }

	async handle(request: AuthenticatedIDRequest, unusedResponse: Response)
	: Promise<NoContentResponseInfo> {
		const manager = new Manager(request)
		const id = Number(request.params.id)
		const oldVersion = await manager.findWithID(id) as ConsultationDocument
		const newVersion = request.body as ConsultationDocument

		await manager.update(id, newVersion.data.attributes)

		Socket.emitToClients(
			makeConsultationNamespace(String(id)),
			"update",
			request.body
		)

		const chatMessageManager = new ChatMessageManager(request)
		if (
			oldVersion.data.attributes.startedAt === null
			|| oldVersion.data.attributes.finishedAt === null
		) {
			let value: string|null = null

			if (
				oldVersion.data.attributes.startedAt === null
				&& newVersion.data.attributes.startedAt !== null
			) {
				value = "has started the consultation."
			} else if (
				oldVersion.data.attributes.finishedAt === null
				&& newVersion.data.attributes.finishedAt !== null
			) {
				value = "Consultation has finished."
			}

			if (value !== null) {
				const activityManager = new ChatMessageActivityManager(request)

				const userProfile = deserialize(request.user) as DeserializedUserProfile

				const activityID = await activityManager.findSessionID(Number(userProfile.data.id), id)

				const chatMessage = await chatMessageManager.create({
					"chatMessageActivityID": Number(activityID),
					"data": {
						value
					},
					"kind": "status"
				})

				Socket.emitToClients(
					makeConsultationChatNamespace(String(id)),
					"create",
					chatMessage
				)
			}
		}

		return new NoContentResponseInfo()
	}
}
