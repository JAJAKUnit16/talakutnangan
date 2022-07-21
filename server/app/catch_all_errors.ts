import { Buffer } from "buffer"
import { UnitError } from "$/types/server"
import { Request, Response, NextFunction } from "!/types/dependent"
import { HTML_MEDIA_TYPE, JSON_API_MEDIA_TYPE } from "$/types/server"

import Log from "$!/singletons/log"
import BaseError from "$!/errors/base"
import ErrorBag from "$!/errors/error_bag"
import URLMaker from "$!/singletons/url_maker"
import RequestEnvironment from "$/helpers/request_environment"

/**
 * Catches all errors on every route for unified error handling.
 * @param error Error thrown in previous middlewares or controllers.
 * @param request Request of the client.
 * @param response Response given to the client.
 * @param next Function to call other middlewares or error handlers.
 */
export default async function(
	error: Error,
	request: Request,
	response: Response,
	next: NextFunction
) {
	await request.transaction.destroyIneffectually()

	if (response.writableEnded) {
		Log.errorMessage("middleware", `Cannot write the error at "${request.path}"`)
	} else {
		if (request.accepts(HTML_MEDIA_TYPE)) {
			let unitError: UnitError|UnitError[] = {
				status: RequestEnvironment.status.INTERNAL_SERVER_ERROR,
				code: "-1",
				title: "Unknown",
				detail: error.message
			}
			let redirectURL = URLMaker.makeBaseURL()

			if (error instanceof BaseError) {
				unitError = error.toJSON()
				redirectURL = error.redirectURL ?? redirectURL
			} else if (error instanceof ErrorBag) {
				unitError = error.toJSON()
			}

			const getEncodedError = Buffer.from(JSON.stringify(unitError)).toString("base64url")

			response.redirect(`${redirectURL}?error=${getEncodedError}`)
		} else if (request.accepts(JSON_API_MEDIA_TYPE)) {
			let unitError: UnitError|UnitError[] = {
				status: RequestEnvironment.status.INTERNAL_SERVER_ERROR,
				code: "-1",
				title: "Unknown",
				detail: error.message
			}

			let status = unitError.status
			if (error instanceof BaseError) {
				unitError = error.toJSON()
				status = unitError.status
			} else if (error instanceof ErrorBag) {
				unitError = error.toJSON()
				// TODO: Base the status from errors
				status = 400
			}

			response.status(status)
			response.type(JSON_API_MEDIA_TYPE)
			if (unitError instanceof Array) {
				response.send({
					errors: unitError
				})
				Log.errorMessage("middleware", "Error: Output multiple errors")
			} else {
				response.send({
					errors: [ unitError ]
				})
				Log.errorMessage("middleware", `${unitError.title}: ${unitError.detail}`)
			}
		} else if (!response.headersSent) {
			response.status(RequestEnvironment.status.NOT_ACCEPTABLE)

			const message = "Error message could not be accepted by the client"
			response.send(message)
			Log.errorMessage("middleware", message)
		}

		response.end()
	}

	next()
}
