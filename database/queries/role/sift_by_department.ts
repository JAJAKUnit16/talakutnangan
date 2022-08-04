import type { FindOptions } from "%/types/dependent"
import type { DepartmentFilter } from "$/types/query"

import Log from "$!/singletons/log"

import User from "%/models/user"
import Department from "%/models/department"
import Condition from "%/managers/helpers/condition"

/**
 * Sift role models which the associated user belongs to a certain department.
 */
export default function<T>(
	currentState: FindOptions<T>,
	constraints: DepartmentFilter
): FindOptions<T> {
	const newState = { ...currentState }

	switch(constraints.filter.department) {
		case "*":
			// do nothing
			break
		default:
			const condition = new Condition()
			condition.equal("id", constraints.filter.department)

			if (newState.include === undefined) {
				newState.include = []
			}

			(newState.include as any[])!.push({
				model: User,
				required: true,
				include: [
					{
						model: Department,
						required: true,
						where: condition.build()
					}
				]
			})
			break
	}

	Log.trace("pipeline", "sift by department")

	return newState
}
