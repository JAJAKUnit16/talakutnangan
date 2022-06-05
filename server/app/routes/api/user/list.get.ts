import { Request, Response } from "express"

import UserManager from "%/managers/user_manager"
import Controller from "!/bases/controller"
import { RawRoute } from "!/types"
import { Criteria } from "%/types"

interface WithQuery {
	query: {
		criteria?: Criteria
	}
}

export default class extends Controller {
	get filePath(): string { return __filename }

	async handle(request: Request & WithQuery, response: Response): Promise<void> {
		const { criteria = null } = request.query
		const manager = new UserManager()
		const users = await manager.list(criteria)

		// TODO: Hide the signatures of users
		response.status(this.status.OK).json(users)
	}
}
