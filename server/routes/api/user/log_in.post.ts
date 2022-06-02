import { v4 } from "uuid"
import { StatusCodes } from "http-status-codes"
import { Request, Response, NextFunction } from "express"

import Middleware from "!/routes/bases/middleware"
import type { RawURLInfo, WithUser }  from "!/types"
import GuestFormController from "!/routes/kinds/guest_form_controller"
import LocalLogInMiddleware from "!/middlewares/authentication/local_log_in"

export default class extends GuestFormController {
	getRawURLInfo(): RawURLInfo {
		return {
			baseURL: "log_in"
		}
	}

	getPremiddlewares(): Middleware[] {
		return [
			...super.getPremiddlewares(),
			new LocalLogInMiddleware()
		]
	}

	get validationRules(): object {
		return {
			email: [ "required", "string", "email", "maxLength:255" ],
			password: [ "required", "string", "minLength:8" ]
		}
	}

	async handle(request: Request & WithUser, response: Response): Promise<void> {
		const user = request.user
		const token = v4()
		request.session.token = token
		response.status(StatusCodes.OK).json({
			email: user.email,
			token
		})
	}
}
