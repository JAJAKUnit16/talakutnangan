/**
 * @module IndependentClientTypes
 * @description This module contains types that are independent from any third-party package. But
 * cannot be shareable since they are only used within the client.
 */

import type { Serializable } from "$/types/database"
import type PermissionGroup from "$/permissions/base"

/**
 * Shape of serialized role
 */
interface Role extends Serializable {
	data: Serializable & {
		type: "role",
		id: number
	}
}

/**
 * Shape of serialized user profile if authenticated
 */
export interface UserProfile extends Serializable {
	data: Serializable & {
		type: "user",
		id: number,
		role: Role[]
	}
}

/**
 * Shape of expected page context parameter of common front-end functions
 */
export interface DeserializedPageContext extends Serializable {
	pageProps: {
		userProfile: UserProfile|null
	}
}

/**
 * Shape of link info
 */
export interface LinkInfo {
	name: string,
	path: string,
	icon: string
}

/**
 * Group of links that may show depending on the conditions configured
 */
export interface ConditionalLinkInfo<T, U extends PermissionGroup<any, T>> {
	/**
	 * If true, there should be no authenticated user
	 */
	mustBeGuest: boolean,

	/**
	 * If null, user may be unauthenticated
	 * If array, requires user to be authenticated and the link is allowed under certain permissions
	 */
	permissionCombinations: T[][]|null,

	/**
	 * If null, user may be unauthenticated
	 * If class instance, indicates the group where the permission combinations belong
	 */
	perimissionGroup: U|null,

	/**
	 * Array of links if it passes the conditions above
	 */
	links: LinkInfo[]
}
