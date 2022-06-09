import Policy from "!/bases/policy"
import type { Request } from "!/types/dependent"

/**
 * Creates middleware to only allow guest or known users only depending on argument.
 *
 * It is the basis of most other policies.
 */
export default class extends Policy {
	private targetAuthenticationState: boolean

	constructor(targetAuthenticationState: boolean) {
		super()
		this.targetAuthenticationState = targetAuthenticationState
	}

	mayAllow(request: Request): boolean {
		return request.isAuthenticated() === this.targetAuthenticationState
	}
}
