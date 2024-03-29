import { FieldRules } from "!/types/validation"
import { Request, Response } from "!/types/dependent"
import type { OptionalMiddleware } from "!/types/independent"

import Policy from "!/bases/policy"
import JSONController from "!/controllers/json"
import NoContentResponseInfo from "!/response_infos/no_content"
import EmployeeScheduleManager from "%/managers/employee_schedule"
import TransactionCommitter from "!/middlewares/miscellaneous/transaction_committer"
import TransactionInitializer from "!/middlewares/miscellaneous/transaction_initializer"

import CommonMiddlewareList from "!/middlewares/common_middleware_list"

import exists from "!/validators/manager/exists"
import makeResourceIdentifierListDocumentRules
	from "!/rule_sets/make_resource_identifier_list_document"

export default class extends JSONController {
	get filePath(): string { return __filename }

	get policy(): Policy {
		return CommonMiddlewareList.employeeSchedulePolicy
	}

	get postValidationMiddlewares(): OptionalMiddleware[] {
		const initializer = new TransactionInitializer()
		return [
			initializer
		]
	}

	makeBodyRuleGenerator(unusedRequest: Request): FieldRules {
		return makeResourceIdentifierListDocumentRules(
			"employee_schedule",
			// TODO: Check if the schedules to archive belongs to current user or has enough permission
			exists,
			EmployeeScheduleManager
		)
	}

	async handle(request: Request, unusedResponse: Response): Promise<NoContentResponseInfo> {
		const manager = new EmployeeScheduleManager(request)

		const IDs = request.body.data.map((identifier: { id: number }) => identifier.id)
		await manager.archiveBatch(IDs)

		return new NoContentResponseInfo()
	}

	get postJobs(): OptionalMiddleware[] {
		return [
			new TransactionCommitter()
		]
	}
}
