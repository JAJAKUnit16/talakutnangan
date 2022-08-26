import { Buffer } from "buffer"
import serveStaticFiles from "sirv"
import { renderPage } from "vite-plugin-ssr"
import { Router as createRouter, Express as ExpressApp } from "express"

import { PageRequest } from "!/types/hybrid"
import { Environment } from "$/types/server"
import { Response, NextFunction } from "!/types/dependent"

import Log from "$!/singletons/log"
import getRoot from "$!/helpers/get_root"
import getEnvironment from "$/helpers/get_environment"

export default async function(app: ExpressApp) {
	const root = getRoot()
	const isProduction
		= getEnvironment() === Environment.Production
		|| getEnvironment() === Environment.IntegrationTest


	if (isProduction) {
		app.use(serveStaticFiles(`${root}/dist/client`))
	} else {
		const { createServer } = require("vite")
		const viteDevServer = await createServer({
			root,
			"server": { "middlewareMode": true }
		})
		app.use(viteDevServer.middlewares)
	}

	const router = createRouter()
	// @ts-ignore
	router.get("*", async(request: PageRequest, response: Response, next: NextFunction): void => {
		if (!request.transaction.hasDestroyed) {
			await request.transaction.destroyIneffectually()

			Log.errorMessage(
				"transaction",
				`Route "${
					request.url
				}" has no page middleware. Therefore, transaction has ended ineffectually.`
			)
		}

		const { "error": rawError = null } = request.query
		// ! There is a possiblity of crashing the server using the query
		let parsedUnitError = null

		try {
			if (rawError !== null) {
				const decodedError = Buffer.from(rawError as string, "base64url").toString("utf8")
				parsedUnitError = JSON.parse(decodedError)
			}
		} catch (error) {
			// Ignore parse or decode errors
		} finally {
			const url = request.originalUrl
			const pageContextInit = {
				"pageProps": {
					...request.pageProps,
					parsedUnitError
				},
				url
			}
			const pageContext: { [key:string]: any } = await renderPage(pageContextInit)
			const { httpResponse, errorStatus } = pageContext
			if (httpResponse) {
				const { body, statusCode, contentType } = httpResponse
				response.status(errorStatus || statusCode).type(contentType).send(body)
			} else {
				next()
			}
		}
	})

	return router
}
