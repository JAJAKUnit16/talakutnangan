import type { FindOptions, IncludeOptions } from "%/types/dependent"

import Log from "$!/singletons/log"

import User from "%/models/user"
import Department from "%/models/department"
import isUndefined from "$/type_guards/is_undefined"
import ProfilePicture from "%/models/profile_picture"

/**
 * Includes default models
 */
export default function<T>(
	currentState: FindOptions<T>,
	unusedConstraints: { [key: string]: any }
): FindOptions<T> {
	const newState = { ...currentState }

	if (isUndefined(newState.include)) {
		newState.include = []
	}

	const castInclude = newState.include as IncludeOptions[]
	castInclude.push({
		"include": [
			{
				"model": ProfilePicture,
				"required": false
			},
			{
				"model": Department,
				"required": true
			}
		],
		"model": User,
		"required": true
	})

	Log.trace("query pipe", "applied default includer")

	return newState
}
