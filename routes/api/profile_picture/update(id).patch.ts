import type { DeserializedUserProfile } from "$/types/documents/user"
import type { AuthenticatedIDRequest, Response } from "!/types/dependent"

import Log from "$!/singletons/log"
import Validation from "!/bases/validation"
import deserialize from "$/helpers/deserialize"
import BodyValidation from "!/validations/body"
import IDParameterValidation from "!/validations/id_parameter"
import ProfilePictureManager from "%/managers/profile_picture"
import NoContentResponseInfo from "!/response_infos/no_content"

import CreateController from "!%/api/user(id)/relationships/profile_picture/create.post"

export default class extends CreateController {
	get filePath(): string { return __filename }

	get validations(): Validation[] {
		const targetValidations = super.validations.filter(
			validation => validation instanceof BodyValidation
		)

		return [
			new IDParameterValidation([
				[ "id", ProfilePictureManager ]
			]),
			...targetValidations
		]
	}

	async handle(request: AuthenticatedIDRequest, unusedResponse: Response)
	: Promise<NoContentResponseInfo> {
		const manager = new ProfilePictureManager(request.transaction, request.cache)
		const { fileContents } = request.body.data.attributes
		const userData = deserialize(request.user) as DeserializedUserProfile
		const userID = userData.data.id
		const id = Number(request.params.id)

		await manager.update(id, {
			fileContents,
			userID
		})

		Log.success("controller", "successfully updated the profile picture")

		return new NoContentResponseInfo()
	}
}
