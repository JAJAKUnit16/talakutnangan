import type { Response } from "$@/types/independent"
import type { DepartmentQueryParameters } from "$/types/query"
import type { RequirePassword } from "$/types/documents/security"
import type {
	DepartmentResourceIdentifier,
	DepartmentAttributes,
	DepartmentResource,
	DeserializedDepartmentResource,
	DepartmentDocument,
	DepartmentListDocument,
	DeserializedDepartmentDocument,
	DeserializedDepartmentListDocument,
	DepartmentIdentifierListDocument
} from "$/types/documents/department"

import { DEPARTMENT_LINK, COUNT_USERS_OF_DEPARTMENT } from "$/constants/template_links"

import BaseFetcher from "$@/fetchers/base"
import specializePath from "$/helpers/specialize_path"
import stringifyQuery from "$@/fetchers/stringify_query"

export default class DepartmentFetcher extends BaseFetcher<
	DepartmentResourceIdentifier,
	DepartmentAttributes<"serialized">,
	DepartmentAttributes<"deserialized">,
	DepartmentResource,
	DeserializedDepartmentResource,
	DepartmentDocument,
	DepartmentListDocument,
	DeserializedDepartmentDocument,
	DeserializedDepartmentListDocument,
	{
		"queryParameters": DepartmentQueryParameters,
		"extraUpdateData": RequirePassword
	}
> {
	constructor() {
		super(DEPARTMENT_LINK)
	}

	countUsers(IDs: string[]): Promise<Response<
		DepartmentResourceIdentifier,
		DepartmentAttributes<"serialized">,
		DepartmentAttributes<"deserialized">,
		DepartmentResource,
		DeserializedDepartmentResource,
		DepartmentIdentifierListDocument<"read">
	>> {
		return this.handleResponse(
			this.getJSON(
				specializePath(COUNT_USERS_OF_DEPARTMENT, {
					"query": stringifyQuery({
						"filter": {
							IDs
						}
					})
				})
			),
			false
		) as Promise<Response<
			DepartmentResourceIdentifier,
			DepartmentAttributes<"serialized">,
			DepartmentAttributes<"deserialized">,
			DepartmentResource,
			DeserializedDepartmentResource,
			DepartmentIdentifierListDocument<"read">
		>>
	}
}
