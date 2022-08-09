import Router from "!/bases/router"
import PostCreate from "!%/api/user(id)/relationships/profile_picture/create.post"

export default class extends Router {
	constructor() {
		super()

		this.useControllers([
			new PostCreate()
		])
	}
}
