import type { RoleManagementInfo } from "$@/types/independent"
import type { DeserializedUserProfile } from "$/types/documents/user"
import type { DeserializedRoleResource } from "$/types/documents/role"

import { role as permissionGroup } from "$/permissions/permission_list"
import {
	UPDATE, ARCHIVE_AND_RESTORE
} from "$/permissions/role_combinations"

export default function(
	userProfile: DeserializedUserProfile<"roles"|"department">,
	role: DeserializedRoleResource
): RoleManagementInfo {
	const isDeleted = Boolean(role.deletedAt)
	const roles = userProfile.data.roles.data

	const mayUpdateRole = permissionGroup.hasOneRoleAllowed(roles, [ UPDATE ]) && !isDeleted

	const mayArchiveRole = permissionGroup.hasOneRoleAllowed(roles, [
		ARCHIVE_AND_RESTORE
	]) && !isDeleted

	const mayRestoreRole = permissionGroup.hasOneRoleAllowed(roles, [
		ARCHIVE_AND_RESTORE
	]) && isDeleted

	return {
		isDeleted,
		mayArchiveRole,
		mayRestoreRole,
		mayUpdateRole
	}
}
