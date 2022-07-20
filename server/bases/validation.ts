import { Validator } from "node-input-validator"

import { SourceParameter, SourcePointer } from "$/types/server"
import { Request, Response, NextFunction } from "!/types/dependent"

import ErrorBag from "$!/errors/error_bag"
import ValidationError from "$!/errors/validation"
import Middleware from "!/bases/middleware"

export default abstract class extends Middleware {
	private validationRules: object

	constructor(validationRules: object) {
		super()
		this.validationRules = validationRules
	}

	abstract getSubject(request: Request): object

	async intermediate(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			await this.validate(this.getSubject(request))
			next()
		} catch(error) {
			next(error)
		}
	}

	async validate(body: object): Promise<void> {
		const validator = new Validator(body, this.validationRules)

		await validator.check()

		const rawErrors = validator.getErrors()

		const errorInfos = Object.keys(rawErrors).sort().map(field => ({
			field,
			message: rawErrors[field].message
		}))

		if (errorInfos.length > 0) {
			throw new ErrorBag(errorInfos.map(info => new ValidationError({
				[this.sourceType]: info.field
			} as SourceParameter|SourcePointer, info.message)))
		}
	}

	/**
	 * Type of source where the validation error comes from.
	 */
	get sourceType(): "pointer"|"parameter" { return "pointer" }
}
