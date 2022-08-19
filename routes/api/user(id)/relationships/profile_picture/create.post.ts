import type { FieldRules } from "!/types/validation"
import type { AuthenticatedIDRequest, Response } from "!/types/dependent"

import Log from "$!/singletons/log"
import Policy from "!/bases/policy"
import UserManager from "%/managers/user"
import Validation from "!/bases/validation"
import CreatedResponseInfo from "!/response_infos/created"
import ProfilePictureManager from "%/managers/profile_picture"
import IDParameterValidation from "!/validations/id_parameter"
import RouteParameterValidation from "!/validations/route_parameter"
import MultipartController from "!/controllers/multipart"

import PermissionBasedPolicy from "!/policies/permission-based"
import { user as permissionGroup } from "$/permissions/permission_list"
import {
	UPDATE_OWN_DATA,
	UPDATE_ANYONE_ON_OWN_DEPARTMENT,
	UPDATE_ANYONE_ON_ALL_DEPARTMENTS
} from "$/permissions/user_combinations"

import buffer from "!/validators/base/buffer"
import integer from "!/validators/base/integer"
import required from "!/validators/base/required"
import notExists from "!/validators/manager/not_exists"
import makeResourceDocumentRules from "!/rule_sets/make_resource_document"

export default class extends MultipartController {
	get filePath(): string { return __filename }

	get policy(): Policy {
		return new PermissionBasedPolicy(permissionGroup, [
			UPDATE_OWN_DATA,
			UPDATE_ANYONE_ON_OWN_DEPARTMENT,
			UPDATE_ANYONE_ON_ALL_DEPARTMENTS
		])
	}

	get validations(): Validation[] {
		return [
			new IDParameterValidation([
				[ "id", UserManager ]
			]),
			new RouteParameterValidation(() => ({
				"id": {
					"constraints": {
						"manager": {
							"className": ProfilePictureManager,
							"columnName": "userID"
						}
					},
					"pipes": [ required, integer, notExists ]
				}
			})),
			...super.validations
		]
	}

	makeBodyRuleGenerator(unusedRequest: AuthenticatedIDRequest): FieldRules {
		const attributes = {
			"fileContents": {
				"constraints": {
					"buffer": {
						// TODO: Think of maximum size of picture
						"allowedMimeTypes": [ "image/png" ],
						// 10 MB
						"maxSize": 1024 * 1024 * 10
					}
				},
				"pipes": [ required, buffer ]
			}
		}

		return makeResourceDocumentRules("profile_picture", attributes, {
			"isNew": true
		})
	}

	async handle(request: AuthenticatedIDRequest, unusedResponse: Response)
	: Promise<CreatedResponseInfo> {
		const manager = new ProfilePictureManager(request.transaction, request.cache)
		const { fileContents } = request.body.data.attributes
		const userID = Number(request.params.id)

		const profilePictureInfo = await manager.create({
			fileContents,
			userID
		})

		Log.success("controller", "successfully uploaded the profile picture")

		return new CreatedResponseInfo(profilePictureInfo)
	}
}
