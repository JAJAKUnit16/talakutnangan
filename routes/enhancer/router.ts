import Router from "!/bases/router"
import GetIndex from "!%/enhancer/index.get"
import ControllerLike from "!/bases/controller-likes/controller"
import { controllers as userControllers } from "!%/enhancer/user/router"
import { controllers as roleControllers } from "!%/enhancer/role/router"
import PostRouter from "!%/enhancer/post/router"
import ForumRouter from "!%/enhancer/forum/router"
import DepartmentRouter from "!%/enhancer/department/router"
import UserSettingsRouter from "!%/enhancer/settings/router"
import ConsultationRouter from "!%/enhancer/consultation/router"
import instantiateSimultaneously from "!/helpers/instantiate_simultaneously"
export default class extends Router {
	constructor() {
		super()

		this.useControllersAsync(instantiateSimultaneously([
			...userControllers,
			...roleControllers
		] as (new() => ControllerLike)[]))

		this.useRoutersAsync(new Promise(resolve => {
			resolve([
				new PostRouter(),
				new ForumRouter(),
				new DepartmentRouter(),
				new ConsultationRouter(),
				new UserSettingsRouter()
			])
		}))

		this.useControllersAsync(new Promise(resolve => {
			resolve([ new GetIndex() ])
		}))
	}
}
