import { readFile } from "fs"
import { promisify } from "util"
import getRoot from "$!/helpers/get_root"
import specializeTemplate from "!/helpers/text/specialize_template"

export default async function(templatePathFromRoot: string, variables: object): Promise<string> {
	const completeTemplatePath = `${getRoot()}/${templatePathFromRoot}`
	const raw = (await promisify(readFile)(completeTemplatePath)).toString()
	const specializeContent = specializeTemplate(raw, variables)

	return specializeContent
}
