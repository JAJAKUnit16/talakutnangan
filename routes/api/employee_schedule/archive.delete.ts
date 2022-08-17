import { FieldRules } from "!/types/validation"
import { Request, Response } from "!/types/dependent"

import Policy from "!/bases/policy"
import JSONController from "!/controllers/json"
import NoContentResponseInfo from "!/response_infos/no_content"
import EmployeeScheduleManager from "%/managers/employee_schedule"

import CommonMiddlewareList from "!/middlewares/common_middleware_list"

import exists from "!/validators/manager/exists"
import makeResourceIdentifierListDocumentRules
	from "!/rule_sets/make_resource_identifier_list_document"

export default class extends JSONController {
	get filePath(): string { return __filename }

	get policy(): Policy {
		// TODO: Combine with permission-based policy
		return CommonMiddlewareList.reachableEmployeeOnlyPolicy
	}

	makeBodyRuleGenerator(unusedRequest: Request): FieldRules {
		return makeResourceIdentifierListDocumentRules(
			"employee_schedule",
			exists,
			EmployeeScheduleManager
		)
	}

	// TODO: Limit the archiving to own user unless there is enough permission to update user info
	async handle(request: Request, unusedResponse: Response): Promise<NoContentResponseInfo> {
		const manager = new EmployeeScheduleManager(request.transaction, request.cache)

		const IDs = request.body.data.map((identifier: { id: number }) => identifier.id)
		await manager.archiveBatch(IDs)

		return new NoContentResponseInfo()
	}
}
