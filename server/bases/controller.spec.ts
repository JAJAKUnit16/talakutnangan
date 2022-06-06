import { getMockReq as makeRequest, getMockRes as makeResponse } from "@jest-mock/express"

import Middleware from "!/bases/middleware"
import { RouteInformation } from "!/types/independent"
import { Request, Response, NextFunction } from "!/types/dependent"

import Controller from "./controller"

describe("Back-end: Base Controller", () => {
	it("can make handlers", () => {
		class ControllerA extends Controller {
			get filePath(): string { return __filename }

			handle(request: Request, response: Response): Promise<void> {
				return Promise.resolve()
			}
		}

		const handlers = (new ControllerA()).handlers

		expect(handlers.middlewares).toHaveLength(0)
		expect(handlers.controllerAsEnd.name).toBe("bound handle")
		expect(handlers.controllerAsMiddleware.name).toBe("bound intermediate")
		expect(handlers.postJobs).toHaveLength(0)
	})

	it("can make route information", () => {
		class ControllerB extends Controller {
			get filePath(): string { return `${this.root}/server/app/routes/a/b/index.get.ts` }

			handle(request: Request, response: Response): Promise<void> {
				return Promise.resolve()
			}
		}

		const routeInformation = (new ControllerB()).routeInformation

		expect(routeInformation).toStrictEqual(<RouteInformation>{
			method: "get",
			path: "/a/b/index",
			purpose: "enhancer",
			description: null
		})
	})

	it("can prepend middleware", () => {
		const middlewareFunction = jest.fn()

		class MiddlewareA extends Middleware {
			intermediate(request: Request, response: Response, next: NextFunction): Promise<void> {
				middlewareFunction()
				return Promise.resolve()
			}
		}

		class ControllerD extends Controller {
			get filePath(): string { return __filename }

			handle(request: Request, response: Response): Promise<void> {
				return Promise.resolve()
			}

			get middlewares(): Middleware[] {
				return [
					...super.middlewares,
					new MiddlewareA()
				]
			}
		}

		const handlers = (new ControllerD()).handlers

		expect(handlers.middlewares).toHaveLength(1)
		expect(handlers.postJobs).toHaveLength(0)

		const request  = makeRequest()
		const { res: response, next, } = makeResponse()
		handlers.middlewares[0].intermediate(request, response, next)
		expect(middlewareFunction).toHaveBeenCalled()
	})

	it("can append post jobs", () => {
		const middlewareFunction = jest.fn()

		class MiddlewareB extends Middleware {
			intermediate(request: Request, response: Response, next: NextFunction): Promise<void> {
				middlewareFunction()
				return Promise.resolve()
			}
		}

		class ControllerE extends Controller {
			get filePath(): string { return __filename }

			handle(request: Request, response: Response): Promise<void> {
				return Promise.resolve()
			}

			get postJobs(): Middleware[] {
				return [
					...super.postJobs,
					new MiddlewareB()
				]
			}
		}

		const handlers = (new ControllerE()).handlers

		expect(handlers.middlewares).toHaveLength(0)
		expect(handlers.postJobs).toHaveLength(1)

		const request  = makeRequest()
		const { res: response, next, } = makeResponse()
		handlers.postJobs[0].intermediate(request, response, next)
		expect(middlewareFunction).toHaveBeenCalled()
	})

	it("can retain context upon passing", () => {
		const targetMessage = "Hello world"
		const handleFunction = jest.fn()

		class ControllerF extends Controller {
			private message = targetMessage

			get filePath(): string { return __filename }

			async handle(request: Request, response: Response): Promise<void> {
				handleFunction(this.message)
			}
		}
		const controller = new ControllerF()
		const request  = makeRequest()
		const { res: response, } = makeResponse()

		controller.handle(request, response)

		expect(handleFunction.mock.calls[0]).toEqual([ targetMessage ])
	})
})
