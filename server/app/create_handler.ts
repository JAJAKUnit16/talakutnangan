import "dotenv/config"
import express from "express"

import type { RequestHandler } from "!/types/dependent"

import Router from "!/bases/router"
import catchAllErrors from "!/app/catch_all_errors"
import createViteDevServer from "!/vite_dev/create_server"
import makeGlobalPostJobs from "!/app/make_global_post_jobs"
import manageAuthentication from "!/app/manage_authentication"
import registerGlobalMiddlewares from "!/app/register_global_middlewares"

export default async function(customRoutes: Router): Promise<express.Express> {
	const app = express()
	app.set("trust proxy", true)

	const viteDevRouter = await createViteDevServer(app)

	await registerGlobalMiddlewares(app)
	await manageAuthentication()

	const globalPostJobs = await makeGlobalPostJobs()
	const rawGlobalPostJobs = globalPostJobs
	.filter(postJob => postJob !== null)
	.map(postJob => postJob!.intermediate!.bind(postJob))

	const allRouteInformation = customRoutes.allUsableRoutes
	for (const { information, handlers } of allRouteInformation) {
		const { method, path } = information
		const { middlewares, controller, postJobs, endHandler } = handlers

		const rawMiddlewares = middlewares
		.filter(middleware => middleware !== null)
		.map(middleware => middleware!.intermediate.bind(middleware))
		const rawPostJobs = postJobs
		.filter(postJob => postJob !== null)
		.map(postJob => postJob!.intermediate!.bind(postJob))
		const rawHandlers = [
			...rawMiddlewares,
			controller,
			...rawPostJobs,
			...rawGlobalPostJobs,
			endHandler
		]
		.filter(middleware => middleware !== null)

		app[method](path, ...<RequestHandler[]><unknown>rawHandlers)
	}

	app.use(viteDevRouter)

	// @ts-ignore
	app.use(catchAllErrors)

	return app
}
