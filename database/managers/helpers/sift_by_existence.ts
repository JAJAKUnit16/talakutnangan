import type { FindOptions, Model } from "%/types/dependent"

import type { ExistenceFilter } from "$/types/database"
import Condition from "%/managers/helpers/condition"
import Log from "$!/singletons/log"

/**
 * Selects if the models to retrieve should all, present or archived.
 */
export default function<T extends Model>(
	currentState: FindOptions<T>,
	constraints: ExistenceFilter
): FindOptions<T> {
	const newState = { ...currentState }

	switch(constraints.filter.existence) {
		case "*":
			newState.paranoid = false
			break
		case "archived":
			const initialCondition = new Condition(newState.where)
			const existCondition = new Condition()
			existCondition.not("deletedAt", null)

			const combinedCondition = new Condition()
			combinedCondition.and(initialCondition, existCondition)
			newState.where = combinedCondition.build()

			newState.paranoid = false
			break
		case "exists":
		default:
			newState.paranoid = true
			break
	}

	Log.trace("pipeline", "sift by existence")

	return newState
}
