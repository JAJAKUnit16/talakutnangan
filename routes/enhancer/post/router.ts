import Router from "!/bases/router"
import GetRead from "!%/enhancer/post/read(id).get"

export const controllers = [ GetRead ]

export default class extends Router {
	constructor() {
		super()

		this.useControllersAsync(new Promise(resolve => {
			resolve([
				new GetRead()
			])
		}))
	}
}
