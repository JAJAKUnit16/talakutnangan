import { Response } from "!/types/dependent"

import type { Serializable } from "$/types/general"
import { JSON_API_MEDIA_TYPE } from "$/types/server"

import Log from "$!/singletons/log"
import RequestEnvironment from "$/helpers/request_environment"

type Body = string|Serializable|Buffer|null

/**
 * Base class to represent the returned response from controller handles.
 */
export default class ResponseInfo {
	private status: number
	private type: string
	private body: Body

	constructor(status: number, body: Body);
	constructor(status: number, type: string, body: Body);
	constructor(
		status: number,
		raw_body_or_type: string|Body,
		raw_body?: Body
	) {
		let type = JSON_API_MEDIA_TYPE
		let body = raw_body_or_type

		if (raw_body) {
			type = raw_body_or_type as string
			body = raw_body as Body
		}

		this.status = status
		this.type = type
		this.body = body as Body
	}

	sendThrough(response: Response): void {
		if (
			RequestEnvironment.isOnTest
			&& this.status !== RequestEnvironment.status.NO_CONTENT
			&& this.body === null
		) {
			const URL = response.req.url
			const method = response.req.method
			const message = `There should be a response body in "${method} ${URL}"`
				+ ` as it returns ${this.status}`
			Log.errorMessage("response", message)
		}

		response.status(this.status)
		response.type(this.type)

		if (this.body !== null) {
			response.send(this.body)
		}
	}
}
