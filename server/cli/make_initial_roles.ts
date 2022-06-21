import { writeFile } from "fs"
import { promisify } from "util"
import RequestEnvironment from "!/helpers/request_environment"
import TagPermissions from "$/permissions/tag_permissions"
import RolePermissions from "$/permissions/role_permissions"
import PostPermissions from "$/permissions/post_permissions"
import ProfilePermissions from "$/permissions/profile_permissions"
import CommentPermissions from "$/permissions/comment_permissions"
import SemesterPermissions from "$/permissions/semester_permissions"
import ProfanityPermissions from "$/permissions/profanity_permissions"
import DepartmentPermissions from "$/permissions/department_permissions"
import AuditTrailPermissions from "$/permissions/audit_trail_permissions"

async function main() {
	const tag = new TagPermissions()
	const role = new RolePermissions()
	const post = new PostPermissions()
	const profile = new ProfilePermissions()
	const comment = new CommentPermissions()
	const semester = new SemesterPermissions()
	const profanity = new ProfanityPermissions()
	const department = new DepartmentPermissions()
	const auditTrail = new AuditTrailPermissions()

	const roles = [
		{
			name: "admin",
			departmentFlags: department.generateMask(
				"view",
				"create",
				"update",
				"archiveAndRestore",
				"mergeDepartment"
			),
			roleFlags: role.generateMask(
				"view",
				"create",
				"update",
				"archiveAndRestore"
			),
			semesterFlags: semester.generateMask(
				"view",
				"create",
				"update",
				"archiveAndRestore"
			),
			tagFlags: tag.generateMask(
				"view",
				"create",
				"update",
				"archiveAndRestore"
			),
			postFlags: post.generateMask(
				"view",
				"create",
				"update",
				"archiveAndRestore",
				"readOverallScope",
				"writeOverallScope",
				"tag"
			),
			commentFlags: comment.generateMask(
				"view",
				"create",
				"update",
				"archiveAndRestore",
				"readOverallScope",
				"writeOverallScope",
				"vote"
			),
			profanityFlags: profanity.generateMask(
				"view",
				"create",
				"update",
				"archiveAndRestore",
				"readOverallScope",
				"writeOverallScope"
			),
			userFlags: profile.generateMask(
				"view",
				"create",
				"update",
				"archiveAndRestore",
				"readOverallScope",
				"writeOverallScope",
				"resetPassword"
			),
			auditTrailFlags: auditTrail.generateMask("view")
		}
		// Add other roles here using this object
		// {
		// 	name: "admin",
		// 	departmentFlags: department.generateMask(),
		// 	roleFlags: role.generateMask(),
		// 	semesterFlags: semester.generateMask(),
		// 	tagFlags: tag.generateMask(),
		// 	postFlags: post.generateMask(),
		// 	commentFlags: comment.generateMask(),
		// 	profanityFlags: profanity.generateMask(),
		// 	userFlags: profile.generateMask(),
		// 	auditTrailFlags: auditTrail.generateMask("view")
		// }
	]

	console.log("Generating the roles...")
	const outputPath = `${RequestEnvironment.root}/database/seeders/initial_roles.json`
	const outputContents = JSON.stringify(roles)
	await promisify(writeFile)(outputPath, outputContents)
	console.log("Generated the roles")
}

main()
