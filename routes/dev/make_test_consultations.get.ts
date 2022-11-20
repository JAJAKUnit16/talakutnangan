/* eslint-disable no-undefined */
import { faker } from "@faker-js/faker"

import type { FieldRules } from "!/types/validation"
import type { Request, Response } from "!/types/dependent"

import Log from "$!/singletons/log"
import Validation from "!/bases/validation"
import QueryValidation from "!/validations/query"
import resetToMidnight from "$/time/reset_to_midnight"
import adjustUntilChosenDay from "$/time/adjust_until_chosen_day"
import adjustBeforeMidnightOfNextDay from "$/time/adjust_before_midnight_of_next_day"

import date from "!/validators/base/date"
import nullable from "!/validators/base/nullable"

import User from "%/models/user"
import Role from "%/models/role"
import Condition from "%/helpers/condition"
import Department from "%/models/department"
import AttachedRole from "%/models/attached_role"
import StudentDetail from "%/models/student_detail"
import ConsultationManager from "%/managers/consultation"

import RoleFactory from "~/factories/role"
import UserFactory from "~/factories/user"
import DepartmentFactory from "~/factories/department"
import StudentDetailFactory from "~/factories/student_detail"
import {
	tag,
	user,
	post,
	comment,
	semester,
	department,
	role
} from "$/permissions/permission_list"

import DevController from "!/controllers/dev"

export default class extends DevController {
	get filePath(): string { return __filename }

	get validations(): Validation[] {
		return [
			new QueryValidation(
				() => {
					const currentDate = new Date()
					const rangeBegin = resetToMidnight(adjustUntilChosenDay(currentDate, 0, -1))
					const rangeEnd = adjustBeforeMidnightOfNextDay(
						adjustUntilChosenDay(currentDate, 6, 1)
					)
					const range: FieldRules = {
						"begin": {
							"constraints": {
								"nullable": {
									"defaultValue": rangeBegin
								}
							},
							"pipes": [ nullable, date ]
						},
						"end": {
							"constraints": {
								"nullable": {
									"defaultValue": rangeEnd
								}
							},
							"pipes": [ nullable, date ]
						}
					}

					return range
				}
			)
		]
	}

	async handle(request: Request, response: Response): Promise<void> {
		const testSecretaryEmail = "secretary@example.net"
		const testSecretaryRoleName = "test_secretary"
		const testStudentEmail = "student@example.net"
		const testStudentNumber = "000-0001"
		const testStudentRoleName = "test_student"
		const testDepartment = "Test Department"

		Log.success("controller", "searching for student role")
		let testStudentRole = await Role.findOne({
			"where": new Condition().equal("name", testStudentRoleName).build()
		})

		Log.success("controller", "making for student role")

		if (testStudentRole === null) {
			testStudentRole = await new RoleFactory()
			.name(() => testStudentRoleName)
			.departmentFlags(department.generateMask("view"))
			.roleFlags(role.generateMask("view"))
			.semesterFlags(semester.generateMask("view"))
			.tagFlags(tag.generateMask("view"))
			.postFlags(post.generateMask("view", "readDepartmentScope"))
			.commentFlags(comment.generateMask(
				"view",
				"create",
				"update",
				"archiveAndRestore",
				"readDepartmentScope",
				"writeOwnScope",
				"vote"
			))
			.userFlags(user.generateMask(
				"view",
				"create",
				"update",
				"readOwnScope",
				"writeOwnScope"
			))
			.auditTrailFlags(0)
			.insertOne()

			Log.success("controller", "created test student role")
		}

		Log.success("controller", "searching for secretary role")
		let testSecretaryRole = await Role.findOne({
			"where": new Condition().equal("name", testSecretaryRoleName).build()
		})

		Log.success("controller", "making for secretary role")

		if (testSecretaryRole === null) {
			testSecretaryRole = await new RoleFactory()
			.name(() => testSecretaryRoleName)
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
				"view"
			))
			.postFlags(post.generateMask(
				"view",
				"create",
				"update",
				"archiveAndRestore",
				"readDepartmentScope",
				"writeOwnScope",
				"tag"
			))
			.commentFlags(comment.generateMask(
				"view",
				"create",
				"update",
				"archiveAndRestore",
				"readDepartmentScope",
				"writeOwnScope",
				"vote"
			))
			.userFlags(user.generateMask(
				"view",
				"create",
				"update",
				"readDepartmentScope",
				"writeDepartmentScope"
			))
			.auditTrailFlags(0)
			.insertOne()

			Log.success("controller", "created test secretary role")
		}

		Log.success("controller", "searching for student dept")
		let testInstituteDepartment = await Department.findOne({
			"where": new Condition().equal("fullName", testDepartment).build()
		})

		Log.success("controller", "making for student department")

		if (testInstituteDepartment === null) {
			testInstituteDepartment = await new DepartmentFactory()
			.fullName(() => testDepartment)
			.mayAdmit()
			.insertOne()

			Log.success("controller", "created test institute department")
		}

		Log.success("controller", "searching for student user")
		let previousStudentUser = await User.findOne({
			"where": new Condition().equal("email", testStudentEmail).build()
		})

		Log.success("controller", "making for student department")
		if (previousStudentUser === null) {
			const createdUser = await new UserFactory()
			.email(() => testStudentEmail)
			.beStudent()
			.in(testInstituteDepartment)
			.insertOne()

			Log.success("controller", "created test student")

			// eslint-disable-next-line require-atomic-updates
			previousStudentUser = createdUser
		}

		await AttachedRole.upsert({
			"roleID": testStudentRole.id,
			"userID": previousStudentUser.id
		})

		Log.success("controller", "attached test student role to test student")

		let previousStudentDetail = await StudentDetail.findOne({
			"where": new Condition().equal("studentNumber", testStudentNumber).build()
		})

		Log.success("controller", "making for student detail")
		if (previousStudentDetail === null) {
			const createdStudentDetail = await new StudentDetailFactory()
			.user(() => Promise.resolve(previousStudentUser as User))
			.studentNumber(() => testStudentNumber)
			.insertOne()

			Log.success("controller", "created test student detail")

			previousStudentDetail = createdStudentDetail
		}

		Log.success("controller", "searching for secretary user")
		let previousSecretaryUser = await User.findOne({
			"where": new Condition().equal("email", testSecretaryEmail).build()
		})
		Log.success("controller", "making for secretary user")
		if (previousSecretaryUser === null) {
			const createdUser = await new UserFactory()
			.email(() => testSecretaryEmail)
			.beReachableEmployee()
			.in(testInstituteDepartment)
			.insertOne()

			Log.success("controller", "created test secretary user")

			previousSecretaryUser = createdUser
		}

		Log.success("controller", "attached test secretary role to test secretary user")

		const consultationManager = new ConsultationManager(request)
		const range = request.query as unknown as { begin: Date, end: Date }
		const consultationCountToCreate = Number(faker.random.numeric())
		const creations: Promise<any>[] = []

		for (let i = 0; i < consultationCountToCreate; ++i) {
			const startedAt = resetToMidnight(faker.date.between(range.begin, range.end))
			startedAt.setHours(faker.datatype.number({
				"max": 11,
				"min": 8
			}))
			const finishedAt = new Date(startedAt)
			finishedAt.setMinutes(faker.datatype.number({
				"max": 30,
				"min": 5
			}))

			const creation = consultationManager.createUsingResource({
				"attributes": {
					"actionTaken": null,
					"deletedAt": null,
					"finishedAt": finishedAt.toJSON(),
					"reason": "Grade-related",
					"scheduledStartAt": new Date().toISOString(),
					"startedAt": startedAt.toJSON()
				},
				"id": undefined,
				"relationships": {
					"chatMessageActivities": undefined,
					"chatMessages": undefined,
					"consultant": {
						"data": {
							"id": previousSecretaryUser.id,
							"type": "user"
						}
					},
					"consultantRole": {
						"data": {
							"id": testSecretaryRole.id,
							"type": "role"
						}
					},
					"participants": {
						"data": [
							{
								"id": previousStudentUser.id,
								"type": "user"
							},
							{
								"id": previousSecretaryUser.id,
								"type": "user"
							}
						]
					}
				},
				"type": "consultation"
			}, Number(previousStudentUser.id))

			creations.push(creation)
		}

		await Promise.all(creations)

		response.status(this.status.OK).send({
			"data": [
				{
					"email": testStudentEmail,
					"password": "password"
				},
				{
					"email": testSecretaryEmail,
					"password": "password"
				}
			],
			"meta": {
				consultationCountToCreate,
				"info": "Please log in one of the following credentials manually"
			}
		})
	}
}
