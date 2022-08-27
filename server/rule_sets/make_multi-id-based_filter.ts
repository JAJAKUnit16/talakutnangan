import type { FieldRules } from "!/types/validation"
import type { BaseManagerClass } from "!/types/independent"

import string from "!/validators/base/string"
import integer from "!/validators/base/integer"
import exists from "!/validators/manager/exists"
import nullable from "!/validators/base/nullable"
import length from "!/validators/comparison/length"
import stringArray from "!/validators/hybrid/string_array"

export default function(
	ClassName: BaseManagerClass,
	{
		mustCast = true
	}: Partial<{
		mustCast: boolean
	}> = {}
): FieldRules {
	return {
		"IDs": {
			"constraints": {
				"array": {
					"constraints": {
						"integer": { mustCast },
						"manager": {
							"className": ClassName,
							"columnName": "id"
						}
					},
					"pipes": [ string, integer, exists ]
				},
				"length": {
					// TODO: Find the best length
					"maximum": 24,
					"minimum": 1
				}
			},
			"pipes": [ nullable, stringArray, length ]
		}
	}
}
