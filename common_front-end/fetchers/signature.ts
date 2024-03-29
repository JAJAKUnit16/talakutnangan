import type { Response } from "$@/types/independent"
import type {
	SignatureResourceIdentifier,
	SignatureAttributes,
	SignatureResource,
	DeserializedSignatureResource,
	SignatureDocument,
	SignatureListDocument,
	DeserializedSignatureDocument,
	DeserializedSignatureListDocument
} from "$/types/documents/signature"
import { JSON_API_MEDIA_TYPE } from "$/types/server"

import { SIGNATURE_LINK, UPDATE_SIGNATURE_OF_USER_LINK } from "$/constants/template_links"

import BaseFetcher from "$@/fetchers/base"
import specializedPath from "$/helpers/specialize_path"

export default class SignatureFetcher extends BaseFetcher<
	SignatureResourceIdentifier<"read">,
	SignatureAttributes<"serialized">,
	SignatureAttributes<"deserialized">,
	SignatureResource,
	DeserializedSignatureResource,
	SignatureDocument,
	SignatureListDocument,
	DeserializedSignatureDocument,
	DeserializedSignatureListDocument
> {
	constructor() {
		super(SIGNATURE_LINK)
	}

	async renew(userID: string, details: FormData): Promise<Response<
		SignatureResourceIdentifier,
		SignatureAttributes<"serialized">,
		SignatureAttributes<"deserialized">,
		SignatureResource,
		DeserializedSignatureResource,
		DeserializedSignatureDocument
	>> {
		const path = specializedPath(UPDATE_SIGNATURE_OF_USER_LINK, { "id": userID })
		const headers = new Headers({ "Accept": JSON_API_MEDIA_TYPE })

		return await this.handleResponse(
			this.patchThrough(path, details, headers)
		) as Response<
			SignatureResourceIdentifier,
			SignatureAttributes<"serialized">,
			SignatureAttributes<"deserialized">,
			SignatureResource,
			DeserializedSignatureResource,
			DeserializedSignatureDocument
		>
	}
}
