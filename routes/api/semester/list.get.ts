import type { FieldRules } from "!/types/validation"
import type { Request, Response } from "!/types/dependent"
import type { SemesterQueryParameters } from "$/types/query"

import Policy from "!/bases/policy"
import ListResponse from "!/response_infos/list"
import Manager from "%/managers/semester"
import QueryController from "!/controllers/query"

import string from "!/validators/base/string"
import nullable from "!/validators/base/nullable"
import length from "!/validators/comparison/length"
import { READ } from "$/permissions/semester_combinations"
import PermissionBasedPolicy from "!/policies/permission-based"
import { semester as permissionGroup } from "$/permissions/permission_list"

import makeListRules from "!/rule_sets/make_list"

export default class extends QueryController {
	get filePath(): string { return __filename }

	get policy(): Policy {
		return new PermissionBasedPolicy(permissionGroup, [
			READ
		])
	}

	makeQueryRuleGenerator(unusedRequest: Request): FieldRules {
		return makeListRules(Manager, {
			"slug": {
				"constraints": {
					"length": {
						"maximum": 255
					},
					"nullable": { "defaultValue": "" }
				},
				"pipes": [ nullable, string, length ]
			}
		})
	}

	async handle(request: Request, unusedResponse: Response): Promise<ListResponse> {
		const constraints = { ...request.query }

		const manager = new Manager(request)
		const semesters = await manager.list(constraints as SemesterQueryParameters)

		return new ListResponse(semesters)
	}
}
