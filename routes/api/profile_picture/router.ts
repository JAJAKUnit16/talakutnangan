import Router from "!/bases/router"
import GetRead from "!%/api/profile_picture/read(id).get"
import PatchUpdate from "!%/api/profile_picture/update(id).patch"

export default class extends Router {
	constructor() {
		super()

		this.useControllers([
			new GetRead(),
			new PatchUpdate()
		])
	}
}
