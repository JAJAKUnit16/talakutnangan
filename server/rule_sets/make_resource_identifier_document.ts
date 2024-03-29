import type { FieldRules, Pipe } from "!/types/validation"
import type { BaseManagerClass } from "!/types/dependent"
import type { IdentifierDocumentOptions } from "!/types/rule_set"

import makeDataDocumentRules from "!/rule_sets/make_data_document"
import makeResourceIdentifierRules from "!/rule_sets/make_resource_identifier"

/**
 * Validates a submitted resource identifier document.
 *
 * @param typeName Name of the type to expect
 * @param validator Pipe to use to validate the ID.
 * @param ClassName Manager class where to validate the ID if it exists
 * @param options Optional arguments
 * @param options.postIDRules Additional rules for the ID.
 * @param options.mustCast If the ID in the identifier should be casted.
 * @param options.extraQueries If there are additional queries
 */
export default function(
	typeName: string,
	validator: Pipe,
	ClassName: BaseManagerClass,
	{
		postIDRules = { "pipes": [] },
		extraIdentifierQueries = {},
		extraQueries = {}
	}: IdentifierDocumentOptions = {}
): FieldRules {
	return makeDataDocumentRules(
		true,
		makeResourceIdentifierRules(typeName, validator, ClassName, {
			"extraQueries": extraIdentifierQueries,
			"mustCastID": false,
			postIDRules
		}),
		{
			extraQueries
		}
	)
}
