import { Buffer } from "buffer"

import { UserKindValues, UserKind } from "$/types/database"
import type { OptionalMiddleware } from "$/types/server"
import type { PreprocessedRequest, Response } from "!/types/dependent"
import type { NewUserNotificationArguments } from "!/types/independent"
import type {
	RawBulkData,
	RawBulkDataForStudent,
	RawBulkDataForEmployee
} from "%/types/independent"

import Log from "!/helpers/log"
import Policy from "!/bases/policy"
import UserManager from "%/managers/user"
import Middleware from "!/bases/middleware"
import CSVParser from "!/middlewares/body_parser/csv"
import CommonMiddlewareList from "!/middlewares/common_middleware_list"
import MultipartController from "!/common_controllers/multipart_controller"

 export interface WithImport {
	body: {
		importedCSV: Buffer
	}
}

export default class extends MultipartController {
	get filePath(): string { return __filename }

	// TODO: Use a permission-based policy
	get policy(): Policy { return CommonMiddlewareList.knownOnlyPolicy }

	get postParseMiddlewares(): OptionalMiddleware[] {
		return [
			new CSVParser("importedCSV")
		]
	}

	get bodyValidationRules(): object {
		// TODO: Create validator for buffers
		// TODO: Validate nested properties of imported CSV
		return {
			importedCSV: [ "required" ],
			roles: [ "required", "array" ],
			kind: [ "required", [ "in", ...UserKindValues] ]
		}
	}

	async handle(
		request: PreprocessedRequest<NewUserNotificationArguments>,
		response: Response
	): Promise<void> {
		Log.trace("controller", "entered POST /api/user/import")

		const manager = new UserManager()
		const body: Partial<RawBulkData> = request.body

		Log.trace("controller", "made user manager")

		body.importedCSV = body.importedCSV!.map(data => {
			if (body.kind! === "student") {
				data.password = (data as RawBulkDataForStudent).studentNumber
			} else {
				// TODO: Check for unreachable employees
				// TODO: Think of a way to produce password for employees
				data.password = (data as RawBulkDataForEmployee).email
			}
			return data
		})

		Log.trace("controller", "generated default passwords")

		const createdModels = await manager.bulkCreate(body as RawBulkData)

		Log.success("controller", "created users in bulk")

		const userDetails = body.importedCSV.map(data => {
			return {
				name: data.name,
				email: data.email,
				kind: body.kind as UserKind,
				password: data.password
			}
		})
		request.nextMiddlewareArguments = { userDetails }

		Log.success("controller", "prepared data to inform new users")

		response.status(this.status.OK).json(createdModels)

		Log.trace("controller", "exiting POST /api/user/import")
	}

	get postJobs(): Middleware[] {
		return [
			CommonMiddlewareList.newUserNotification
		]
	}
}
