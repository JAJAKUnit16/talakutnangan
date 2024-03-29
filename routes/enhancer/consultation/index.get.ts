import type { DocumentProps } from "$/types/server"
import type { AuthenticatedRequest } from "!/types/dependent"
import type { DeserializedUserProfile } from "$/types/documents/user"
import type { ConsultationListDocument } from "$/types/documents/consultation"

import { READ_CONSULTATION } from "$/constants/template_page_paths"

import Policy from "!/bases/policy"
import Middleware from "!/bases/middleware"
import Manager from "%/managers/consultation"
import URLMaker from "$!/singletons/url_maker"
import deserialize from "$/object/deserialize"
import PageMiddleware from "!/bases/controller-likes/page_middleware"
import CommonMiddlewareList from "!/middlewares/common_middleware_list"
import DynamicGatedRedirector from "!/middlewares/miscellaneous/dynamic_gated_redirector"

export default class extends PageMiddleware {
	get filePath(): string { return __filename }

	get policy(): Policy {
		return CommonMiddlewareList.consultationParticipantsOnlyPolicy
	}

	getDocumentProps(): DocumentProps {
		return {
			"description": "Consultation chat platform for MCC",
			"title": "Consultations | Talakutnangan"
		}
	}

	get postValidationMiddlewares(): Middleware[] {
		return [
			new DynamicGatedRedirector(async(request: AuthenticatedRequest) => {
				const user = deserialize(request.user) as DeserializedUserProfile
				const manager = new Manager(request)

				const consultations = await manager.list({
					"filter": {
						"consultationScheduleRange": "*",
						"existence": "*",
						"user": Number(user.data.id)
					},
					"page": {
						"limit": 1,
						"offset": 0
					},
					"sort": [ "-updatedAt" ]
				}) as ConsultationListDocument

				if (consultations.data.length === 0) {
					return null
				}

				return {
					"location": URLMaker.makeURLFromPath(READ_CONSULTATION, {
						"id": consultations.data[0].id
					})
				}
			})
		]
	}
}
