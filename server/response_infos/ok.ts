import type { Serializable } from "$/types/general"
import { JSON_API_MEDIA_TYPE } from "$/types/server"

import ResponseInfo from "!/bases/response_info"
import RequestEnvironment from "$/helpers/request_environment"

export default class extends ResponseInfo {
	constructor(body: Serializable, type: string = JSON_API_MEDIA_TYPE) {
		super(RequestEnvironment.status.OK, type, body)
	}
}
