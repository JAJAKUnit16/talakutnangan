import type { Pipe } from "$/types/database"
import type { CommonQueryParameters } from "$/types/query"
import type { ModelCtor, FindAndCountOptions } from "%/types/dependent"
import type { AuditTrailAttributes } from "$/types/documents/audit_trail"

import BaseManager from "%/managers/base"
import AuditTrail from "%/models/audit_trail"
import includeUser from "%/queries/audit_trail/include_user"
import AuditTrailTransformer from "%/transformers/audit_trail"

export default class  extends BaseManager<AuditTrail, AuditTrailAttributes, CommonQueryParameters> {
	get model(): ModelCtor<AuditTrail> { return AuditTrail }

	get transformer(): AuditTrailTransformer { return new AuditTrailTransformer() }

	get singleReadPipeline(): Pipe<FindAndCountOptions<AuditTrail>, CommonQueryParameters>[] {
		return [
			includeUser,
			...super.singleReadPipeline
		]
	}

	get listPipeline(): Pipe<FindAndCountOptions<AuditTrail>, CommonQueryParameters>[] {
		return [
			includeUser,
			...super.listPipeline
		]
	}

	protected get exposableColumns(): string[] {
		const excludedColumns = new Set([ "extra", "userID" ])
		return super.exposableColumns.filter(columnName => !excludedColumns.has(columnName))
	}
}
