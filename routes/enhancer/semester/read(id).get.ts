import type { Serializable } from "$/types/general"
import type { DocumentProps } from "$/types/server"
import type { AuthenticatedRequest } from "!/types/dependent"

import Policy from "!/bases/policy"
import Manager from "%/managers/semester"
import Validation from "!/bases/validation"
import present from "!/validators/manager/present"
import IDParameterValidator from "!/validations/id_parameter"
import PageMiddleware from "!/bases/controller-likes/page_middleware"

import { UPDATE } from "$/permissions/semester_combinations"
import PermissionBasedPolicy from "!/policies/permission-based"
import { semester as permissionGroup } from "$/permissions/permission_list"

export default class extends PageMiddleware {
	get filePath(): string { return __filename }

	get policy(): Policy {
		return new PermissionBasedPolicy(permissionGroup, [
			UPDATE
		])
	}

	get validations(): Validation[] {
		return [
			new IDParameterValidator([
				[ "id", Manager, present ]
			])
		]
	}

	getDocumentProps(): DocumentProps {
		return {
			"description": "Consultation chat platform for MCC",
			"title": "Edit Semester | Talakutnangan"
		}
	}

	async getPageProps(request: AuthenticatedRequest): Promise<Serializable> {
		const { id } = request.params
		const manager = new Manager(request)

		const semester = await manager.findWithID(Number(id), {
			"constraints": {
				"filter": {
					"existence": "*"
				}
			}
		})

		return {
			semester
		}
	}
}