import type { FieldRules } from "!/types/validation"
import type { Request, Response } from "!/types/dependent"
import type { BaseManagerClass } from "!/types/independent"

import Policy from "!/bases/policy"
import ConsultationManager from "%/managers/consultation"
import NoContentResponseInfo from "!/response_infos/no_content"
import DoubleBoundJSONController from "!/controllers/double_bound_json"

import { UPDATE } from "$/permissions/department_combinations"
import { department as permissionGroup } from "$/permissions/permission_list"
import PermissionBasedPolicy from "!/policies/permission-based"

import date from "!/validators/base/date"
import string from "!/validators/base/string"
import same from "!/validators/comparison/same"
import required from "!/validators/base/required"
import nullable from "!/validators/base/nullable"
import regex from "!/validators/comparison/regex"
import length from "!/validators/comparison/length"
import makeResourceDocumentRules from "!/rule_sets/make_resource_document"
import uniqueConsultationSchedule from "!/validators/date/unique_consultation_schedule"

export default class extends DoubleBoundJSONController {
	get filePath(): string { return __filename }

	get policy(): Policy {
		return new PermissionBasedPolicy(permissionGroup, [
			UPDATE
		])
	}

	makeBodyRuleGenerator(unusedRequest: Request): FieldRules {
		const attributes: FieldRules = {
			"actionTaken": {
				"constraints": {
					"same": {
						"value": null
					}
				},
				"pipes": [ nullable, same ]
			},
			"finishedAt": {
				"constraints": {
					"same": {
						"value": null
					}
				},
				"pipes": [ nullable, same ]
			},
			"reason": {
				"constraints": {
					"length": {
						"maximum": 100,
						"minimum": 10
					},
					"regex": {
						"match": /[a-zA-Z0-9!?. -]/u
					}
				},
				"pipes": [ required, string, length, regex ]
			},
			"scheduledStartAt": {
				"constraints": {
					// TODO: Check if the schedule fits within the schedule of employee
					"uniqueConsultationSchedule": {
						"conflictConfirmationPointer": "meta.doesAllowConflicts",
						"userIDPointer": "meta.reachableEmployeeID"
					}
				},
				"pipes": [ required, date, uniqueConsultationSchedule ]
			},
			"startedAt": {
				"constraints": {
					"same": {
						"value": null
					}
				},
				"pipes": [ nullable, same ]
			}
		}

		return makeResourceDocumentRules("consultation", attributes)
	}

	get manager(): BaseManagerClass { return ConsultationManager }

	async handle(request: Request, unusedResponse: Response): Promise<NoContentResponseInfo> {
		const manager = new ConsultationManager(request.transaction, request.cache)
		const { id } = request.params
		await manager.update(Number(id), request.body.data.attributes)

		return new NoContentResponseInfo()
	}
}
