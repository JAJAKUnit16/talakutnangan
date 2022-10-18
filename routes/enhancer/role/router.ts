import Router from "!/bases/router"
import GetList from "!%/enhancer/role/list.get"
import GetCreate from "!%/enhancer/role/create.get"

export default class extends Router {
	constructor() {
		super()

		this.useControllersAsync(new Promise(resolve => {
			resolve([
				new GetList(),
				new GetCreate()
			])
		}))
	}
}
