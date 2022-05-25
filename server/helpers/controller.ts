import { Request, Response, NextFunction,  } from "express"

import { Route } from "!/types"
import Middleware from "!/helpers/middleware"
import RequestEnvironment from "!/helpers/request_environment"

export default abstract class extends Middleware {
	private const premiddlewares: Middleware[] = []
	private const postmiddlewares: Middleware[] = []
	private const overridesPrefix: boolean
	private const URL: string

	constructor(URL: string, overridesPrefix: boolean = false) {
		super()

		this.URL = URL
		this.overridesPrefix = overridesPrefix
	}

	abstract private handle(request: Request, response: Response): void

	private intermediate(request: Request, response: Response, next: NextFunction): void {
		this.handle(request, response)

		next()
	}

	/**
	 * Adds middleware before the handler will be executed.
	 *
	 * Other middlewares previously prepended will be executed first before the new prepended
	 * middleware.
	 */
	protected prependMiddleware(middleware: Middleware): void {
		this.premiddlewares.push(middleware)
	}

	/**
	 * Adds middleware after the handler executed.
	 *
	 * Other middlewares previously appended will be executed first before the new appended
	 * middleware.
	 *
	 * Make sure the last middleware appended is a controller.
	 */
	protected appendMiddleware(middleware: Middleware): void {
		this.postmiddlewares.push(middleware)
	}

	generateRoute(prefix: string|null = null): Route {
		const URL = (
			this.overridesPrefix || prefix === "/" || prefix === null
			? this.URL
			: `${prefix}/${this.URL}`
		)

		const handlers = this.flattenHandlers(this.premiddlewares)

		if (this.postmiddlewares.length === 0) {
			handlers.push(this.handle)

		} else {
			handlers.push(this.intermediate)

			for (const postHandler of (this.flattenHandlers(this.postmiddlewares))) {
				handlers.push(postHandler)
			}
		}

		return {
			URL,
			handlers
		}
	}

	private flattenHandlers(middlewares: Middleware[]): RequestHandler[] {
		const handlers = []

		for (const middleware of middlewares) {
			const subhandlers = middleware.generateHandlers()

			for(const subhandler of subhandlers) {
				handlers.push(subhandler)
			}
		}

		return handlers
	}
}
