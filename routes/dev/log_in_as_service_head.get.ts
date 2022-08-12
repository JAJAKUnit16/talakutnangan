import { PreprocessedRequest, Response } from "!/types/dependent"

import Log from "$!/singletons/log"

import User from "%/models/user"
import Role from "%/models/role"
import Department from "%/models/department"
import AttachedRole from "%/models/attached_role"

import RoleFactory from "~/factories/role"
import UserFactory from "~/factories/user"
import DepartmentFactory from "~/factories/department"
import {
	tag,
	user,
	post,
	comment,
	semester,
	profanity,
	department,
	role
} from "$/permissions/permission_list"

import Middleware from "!/bases/middleware"
import Condition from "%/managers/helpers/condition"
import DevController from "!/controllers/dev_controller"
import LocalLogInMiddleware from "!/middlewares/authentication/local_log_in"

interface OwnArguments {
	hasPreprocessed?: boolean
}

export default class extends DevController {
	get filePath(): string { return __filename }

	async handle(request: PreprocessedRequest<OwnArguments>, response: Response): Promise<void> {
		if (request.nextMiddlewareArguments?.hasPreprocessed) {
			response.status(this.status.OK).end()
		} else {
			const testEmail = "service_head@example.net"
			const testRoleName = "test_service_head"
			const testDepartmentName = "Test Service Department"

			Log.success("controller", "searching for role")
			let testRole = await Role.findOne({
				where: (new Condition()).equal("name", testRoleName).build()
			})

			Log.success("controller", "making for role")

			if (testRole === null) {
				testRole = await new RoleFactory()
					.name(() => testRoleName)
					.departmentFlags(department.generateMask(
						"view"
					))
					.roleFlags(role.generateMask(
						"view"
					))
					.semesterFlags(semester.generateMask(
						"view"
					))
					.tagFlags(tag.generateMask(
						"view",
						"create",
						"update",
						"archiveAndRestore"
					))
					.postFlags(post.generateMask(
						"view",
						"create",
						"update",
						"archiveAndRestore",
						"readDepartmentScope",
						"writeDepartmentScope",
						"tag"
					))
					.commentFlags(comment.generateMask(
						"view",
						"create",
						"update",
						"archiveAndRestore",
						"readDepartmentScope",
						"writeDepartmentScope",
						"vote"
					))
					.profanityFlags(profanity.generateMask("view", "readOverallScope"))
					.userFlags(user.generateMask(
						"view",
						"create",
						"update",
						"archiveAndRestore",
						"readDepartmentScope",
						"writeDepartmentScope"
					))
					.auditTrailFlags(0)
					.insertOne()

				Log.success("controller", "created test  role")
			}

			Log.success("controller", "searching for  dept")
			let testServiceDepartment = await Department.findOne({
				where: (new Condition()).equal("fullName", testDepartmentName).build()
			})

			Log.success("controller", "making for  dept")
			if (testServiceDepartment === null) {
				testServiceDepartment = await new DepartmentFactory()
					.name(() => testDepartmentName)
					.mayNotAdmit()
					.insertOne()

				Log.success("controller", "created test department")
			}

			Log.success("controller", "searching for  user")
			let previousUser = await User.findOne({
				where: (new Condition()).equal("email", testEmail).build()
			})
			Log.success("controller", "making for  user")
			if (previousUser === null) {
				const user = await new UserFactory()
					.email(() => testEmail)
					.beReachableEmployee()
					.in(testServiceDepartment)
					.insertOne()

				Log.success("controller", "created test user")

				previousUser = user
			}

			await AttachedRole.upsert({
				userID: previousUser.id,
				roleID: testRole.id
			})

			Log.success("controller", "attached test role to test user")

			request.body = {
				email: testEmail,
				password: "password"
			}

			request.nextMiddlewareArguments = { hasPreprocessed: true }
		}
	}

	get postJobs(): Middleware[] {
		return [
			new LocalLogInMiddleware(),
			this
		]
	}
}
