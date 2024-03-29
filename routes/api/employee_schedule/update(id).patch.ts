import type { FieldRules } from "!/types/validation"
import type { DeserializedUserProfile } from "$/types/documents/user"
import type { EmployeeScheduleDocument } from "$/types/documents/employee_schedule"
import type { AuthenticatedIDRequest, Response, BaseManagerClass } from "!/types/dependent"

import { DayValues } from "$/types/database"
import { MINUTE_SCHEDULE_INTERVAL } from "$/constants/numerical"

import Log from "$!/singletons/log"
import UserManager from "%/managers/user"
import deserialize from "$/object/deserialize"
import Manager from "%/managers/employee_schedule"
import NoContentResponseInfo from "!/response_infos/no_content"
import convertTimeToMinutes from "$/time/convert_time_to_minutes"
import DoubleBoundJSONController from "!/controllers/double_bound_json"

import Policy from "!/bases/policy"
import BelongsToCurrentUserPolicy from "!/policies/belongs_to_current_user"
import { user as permissionGroup } from "$/permissions/permission_list"
import {
	UPDATE_ANYONE_ON_OWN_DEPARTMENT,
	UPDATE_ANYONE_ON_ALL_DEPARTMENTS
} from "$/permissions/user_combinations"

import string from "!/validators/base/string"
import integer from "!/validators/base/integer"
import exists from "!/validators/manager/exists"
import required from "!/validators/base/required"
import range from "!/validators/comparison/range"
import oneOf from "!/validators/comparison/one-of"
import divisibleBy from "!/validators/date/divisible_by"
import isLessThan from "!/validators/comparison/is_less_than"
import makeRelationshipRules from "!/rule_sets/make_relationships"
import makeResourceDocumentRules from "!/rule_sets/make_resource_document"
import uniqueEmployeeSchedule from "!/validators/date/unique_employee_schedule"
import existWithSameAttribute from "!/validators/manager/exist_with_same_attribute"

export default class extends DoubleBoundJSONController {
	get filePath(): string { return __filename }

	get policy(): Policy {
		// TODO: Ensure user is an employee if it is own kind
		return new BelongsToCurrentUserPolicy(this.manager, {
			"bypassNecessarilyWith": {
				"combinations": [
					UPDATE_ANYONE_ON_OWN_DEPARTMENT,
					UPDATE_ANYONE_ON_ALL_DEPARTMENTS
				],
				"group": permissionGroup
			}
		})
	}

	makeBodyRuleGenerator(unusedRequest: AuthenticatedIDRequest): FieldRules {
		const attributes: FieldRules = {
			"dayName": {
				"constraints": {
					"oneOf": {
						"values": [ ...DayValues ]
					}
				},
				"pipes": [ required, string, oneOf ]
			},
			"scheduleEnd": {
				"constraints": {
					"divisibleBy": {
						"value": MINUTE_SCHEDULE_INTERVAL
					},
					"range": {
						"maximum": convertTimeToMinutes("23:59"),
						"minimum": convertTimeToMinutes("00:01")
					}
				},
				"pipes": [ required, integer, divisibleBy, range ]
			},
			"scheduleStart": {
				"constraints": {
					"divisibleBy": {
						"value": MINUTE_SCHEDULE_INTERVAL
					},
					"isLessThan": {
						"pointer": "data.attributes.scheduleEnd"
					},
					"range": {
						"maximum": convertTimeToMinutes("23:58"),
						"minimum": convertTimeToMinutes("00:00")
					}
				},
				"pipes": [ required, integer, divisibleBy, range, isLessThan ]
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
						"pipes": [ existWithSameAttribute ]
					}
				},
				"relationshipName": "user",
				"typeName": "user",
				"validator": exists
			}
		])

		return makeResourceDocumentRules("employee_schedule", attributes, {
			"extraDataQueries": relationships,
			"postAttributeValidation": {
				"constraints": {
					"uniqueEmployeeSchedule": {
						"employeeScheduleIDPointer": "data.id",
						"userIDPointer": "data.relationships.user.data.id"
					}
				},
				"pipes": [ uniqueEmployeeSchedule ]
			}
		})
	}

	get manager(): BaseManagerClass { return Manager }

	async handle(request: AuthenticatedIDRequest, unusedResponse: Response)
	: Promise<NoContentResponseInfo> {
		const manager = new Manager(request)
		const { data } = request.body as EmployeeScheduleDocument<"update">
		const { id, attributes } = data

		await manager.update(Number(id), attributes)

		Log.success("controller", "successfully updated the employee schedule")

		return new NoContentResponseInfo()
	}
}
