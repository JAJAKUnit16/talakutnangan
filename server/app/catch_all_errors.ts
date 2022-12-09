/* eslint-disable complexity */
import type { Request, Response, NextFunction } from "!/types/dependent"
import { UnitError, HTML_MEDIA_TYPE, JSON_API_MEDIA_TYPE } from "$/types/server"

import Log from "$!/singletons/log"
import BaseError from "$!/errors/base"
import ErrorBag from "$!/errors/error_bag"
import URLMaker from "$!/singletons/url_maker"
import encodeToBase64 from "$!/helpers/encode_to_base64"
import RequestEnvironment from "$/singletons/request_environment"

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
	await request.transaction?.destroyIneffectually()

	if (response.writableEnded) {
		Log.errorMessage("middleware", `Cannot write the error at "${request.path}"`)
	} else {
		if (request.accepts(HTML_MEDIA_TYPE)) {
			let unitError: UnitError|UnitError[] = {
				"code": "-1",
				"detail": error.message,
				"status": RequestEnvironment.status.INTERNAL_SERVER_ERROR,
				"title": "Unknown"
			}
			let redirectURL = URLMaker.makeBaseURL()

			if (error instanceof BaseError) {
				unitError = error.toJSON()
				redirectURL = error.redirectURL ?? redirectURL
			} else if (error instanceof ErrorBag) {
				const [ firstError ] = error.toJSON()
				unitError = firstError
			}

			const getEncodedError = encodeToBase64(unitError)

			response.redirect(`${redirectURL}?error=${getEncodedError}`)

			Log.errorMessage("middleware", `Error: Output multiple errors${
				RequestEnvironment.isNotOnProduction
					? ` (${error.name}'s stack: ${error.stack})`
					: ""
			}`)
		} else if (request.accepts(JSON_API_MEDIA_TYPE)) {
			let unitError: UnitError|UnitError[] = {
				"code": "-1",
				"detail": error.message,
				"status": RequestEnvironment.status.INTERNAL_SERVER_ERROR,
				"title": "Unknown"
			}

			let { status } = unitError
			if (error instanceof BaseError) {
				unitError = error.toJSON()
				const errorsStatus = unitError.status
				status = errorsStatus
			} else if (error instanceof ErrorBag) {
				unitError = error.toJSON()
				// TODO: Base the status from errors
				status = 400
			}

			if (!response.headersSent) {
				response.status(status)
				response.type(JSON_API_MEDIA_TYPE)
			}
			if (unitError instanceof Array) {
				if (!response.headersSent) {
					response.send({
						"errors": unitError
					})
				}

				Log.errorMessage("middleware", `Error: Output multiple errors${
					RequestEnvironment.isNotOnProduction
						? ` (${error.name}'s stack: ${error.stack})`
						: ""
				}`)
			} else {
				if (!response.headersSent) {
					response.send({
						"errors": [ unitError ]
					})
				}
				Log.errorMessage("middleware", `${unitError.title}: ${unitError.detail}${
					RequestEnvironment.isNotOnProduction
						? ` (${error.name}'s stack: ${error.stack})`
						: ""
				}`)
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
