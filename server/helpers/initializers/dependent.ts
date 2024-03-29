import { SourceType } from "$/types/database"

import Log from "$!/singletons/log"
import Database from "%/data_source/database"
import Transport from "!/singletons/transport"
import RequestEnvironment from "$/singletons/request_environment"

import isUndefined from "$/type_guards/is_undefined"

export default async function(sourceType: SourceType) {
	await Database.initialize(sourceType)

	Log.trace("app", "initialized database")

	if (
		!isUndefined(process.env.EMAIL_HOST)
		&& !isUndefined(process.env.EMAIL_PORT)
		&& !isUndefined(process.env.EMAIL_USER)
		&& !isUndefined(process.env.EMAIL_PASS)
	) {
		Transport.initialize(
			process.env.EMAIL_HOST,
			Number(process.env.EMAIL_PORT),
			process.env.EMAIL_USER,
			process.env.EMAIL_PASS
		)

		Log.trace("app", "initialized e-mail transport")
	} else if (!RequestEnvironment.isOnTest) {
		console.error("Some e-mail variables are not defined")
		process.exit(1)
	}
}
