import type { PageRequest } from "!/types/hybrid"
import type { Response, NextFunction } from "!/types/dependent"
import type { DeserializedUserProfile } from "$/types/documents/user"

import Policy from "!/bases/policy"
import Manager from "$/helpers/manager"
import Validation from "!/bases/validation"
import deserialize from "$/helpers/deserialize"
import PermissionBasedPolicy from "!/policies/permission-based"
import PageMiddleware from "!/bases/controller-likes/page_middleware"
import { user as permissionGroup } from "$/permissions/permission_list"
import { READ_ANYONE_ON_OWN_DEPARTMENT } from "$/permissions/user_combinations"

export default class extends PageMiddleware {
	get filePath(): string { return __filename }

	get policy(): Policy {
		return new PermissionBasedPolicy(permissionGroup, [ READ_ANYONE_ON_OWN_DEPARTMENT ])
	}

	get bodyParser(): null { return null }

	get validations(): Validation[] { return [] }

	async intermediate(request: PageRequest, response: Response, next: NextFunction)
	: Promise<void> {
		const managerKind = new Manager(deserialize(request.user!) as DeserializedUserProfile)
		let location = ""
		if (managerKind.isInstituteLimited()) location = "/user/institute_users"
		else if (managerKind.isAdmin()) location = "/admin/resource_config/users"

		if (!location) {
			super.intermediate(request, response, next)
		} else {
			response.writeHead(this.status.MOVED_TEMPORARILY, { Location : location })
			response.end()
		}
	}
}
