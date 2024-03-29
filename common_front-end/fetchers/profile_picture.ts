import { JSON_API_MEDIA_TYPE } from "$/types/server"
import type { Response } from "$@/types/independent"
import type {
	ProfilePictureResourceIdentifier,
	ProfilePictureAttributes,
	ProfilePictureResource,
	DeserializedProfilePictureResource,
	ProfilePictureDocument,
	ProfilePictureListDocument,
	DeserializedProfilePictureDocument,
	DeserializedProfilePictureListDocument
} from "$/types/documents/profile_picture"

import {
	PROFILE_PICTURE_LINK,
	UPDATE_PROFILE_PICTURE_OF_USER_LINK
} from "$/constants/template_links"

import BaseFetcher from "$@/fetchers/base"
import specializedPath from "$/helpers/specialize_path"

export default class ProfilePictureFetcher extends BaseFetcher<
	ProfilePictureResourceIdentifier<"read">,
	ProfilePictureAttributes<"serialized">,
	ProfilePictureAttributes<"deserialized">,
	ProfilePictureResource,
	DeserializedProfilePictureResource,
	ProfilePictureDocument,
	ProfilePictureListDocument,
	DeserializedProfilePictureDocument,
	DeserializedProfilePictureListDocument
> {
	constructor() {
		super(PROFILE_PICTURE_LINK)
	}

	async createFile(userID: string, details: FormData): Promise<Response<
		ProfilePictureResourceIdentifier<"read">,
		ProfilePictureAttributes<"serialized">,
		ProfilePictureAttributes<"deserialized">,
		ProfilePictureResource,
		DeserializedProfilePictureResource,
		DeserializedProfilePictureDocument
	>> {
		const path = specializedPath(UPDATE_PROFILE_PICTURE_OF_USER_LINK, {
			"id": userID,
			"type": this.links.type
		})

		const headers = new Headers({ "Accept": JSON_API_MEDIA_TYPE })

		return await this.handleResponse(
			this.postTo(path, details, headers)
		) as Response<
			ProfilePictureResourceIdentifier<"read">,
			ProfilePictureAttributes<"serialized">,
			ProfilePictureAttributes<"deserialized">,
			ProfilePictureResource,
			DeserializedProfilePictureResource,
			DeserializedProfilePictureDocument
		>
	}

	async updateFile(profilePictureID: string, details: FormData): Promise<Response<
		ProfilePictureResourceIdentifier<"read">,
		ProfilePictureAttributes<"serialized">,
		ProfilePictureAttributes<"deserialized">,
		ProfilePictureResource,
		DeserializedProfilePictureResource,
		DeserializedProfilePictureDocument
	>> {
		const path = specializedPath(this.links.bound, {
			"id": profilePictureID
		})
		const headers = new Headers({ "Accept": JSON_API_MEDIA_TYPE })

		return await this.handleResponse(
			this.patchThrough(path, details, headers)
		) as Response<
			ProfilePictureResourceIdentifier<"read">,
			ProfilePictureAttributes<"serialized">,
			ProfilePictureAttributes<"deserialized">,
			ProfilePictureResource,
			DeserializedProfilePictureResource,
			DeserializedProfilePictureDocument
		>
	}
}
