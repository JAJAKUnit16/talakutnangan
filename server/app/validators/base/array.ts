import type { ValidationConstraints, ErrorPointer, ArrayRuleConstraints } from "!/types/independent"

import validate from "!/app/validators/validate"
import unifyErrors from "!/app/validators/unify_errors"

/**
 * Validator to check if data is an array
 */
export default async function(
	currentState: Promise<any>,
	constraints: ValidationConstraints & ArrayRuleConstraints
): Promise<any> {
	const value = await currentState

	if (Array.isArray(value)) {
		const sanitizedInputs = []
		const errors: (ErrorPointer|Error)[] = []
		const expectedSanitizeLength = value.length

		for (let i = 0; i < expectedSanitizeLength; ++i ) {
			const subvalue = value[i]
			try {
				const sanitizedInput = await validate({
					i: constraints.array
				}, constraints.request, {
					i: subvalue
				})

				sanitizedInputs.push(sanitizedInput)
			} catch(error) {
				if (Array.isArray(error)) {
					errors.push(...error)
				} else {
					errors.push(error as ErrorPointer|Error)
				}
			}
		}

		if (errors.length > 0) {
			throw unifyErrors(constraints.field, errors)
		} else {
			return sanitizedInputs
		}
	} else {
		throw {
			field: constraints.field,
			messageMaker: (field: string) => `Field "${field}" must be an array.`
		}
	}
}
