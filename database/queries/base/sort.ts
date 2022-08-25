import type { Sort } from "$/types/query"
import type { FindOptions, Model } from "%/types/dependent"

import Log from "$!/singletons/log"

/**
 * Sorts the selected models.
 */
export default function<T extends Model>(
	currentState: FindOptions<T>,
	constraints: Sort
): FindOptions<T> {
	const newState = { ...currentState }

	const rawSortInfo = constraints.sort.map(column => {
		if (column.startsWith("-")) {
			return [ column.slice(1), "DESC" ]
		}

		return [ column, "ASC" ]
	})

	if (rawSortInfo.length > 0) {
		if (typeof newState.order === "undefined") {
			newState.order = []
		}

		const castOrder = newState.order as any[]
		castOrder.push(...rawSortInfo)
	}

	Log.trace("pipeline", "sort")

	return newState
}
