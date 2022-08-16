import type { GeneralObject } from "$/types/general"
import type {
	PermissionMap,
	PermissionInfo,
	ExternalPermissionDependencyInfo
} from "$/types/permission"

import makeUnique from "$/helpers/array/make_unique"

/**
 * Base class for permission groups.
 *
 * This is safe to use in client-side. Useful to check if a certain operation is safe to be
 * executed.
 */
export default abstract class<T extends GeneralObject<number>, U> {
	/**
	 * Name of the permission group
	 */
	abstract get name(): string

	/**
	 * Map of permissions under the group
	 */
	abstract get permissions(): PermissionMap<U>

	/**
	 * Returns true if all stated permissions are allowed for the role. Otherwise, false.
	 *
	 * @param role An object which contains flags named under a permission group name.
	 * @param permissionNames Name of the permission(s) to check if they are allowed in the role.
	 */
	mayAllow(role: T, ...permissionNames: U[]): boolean {
		const mask = this.generateMask(...permissionNames)
		return this.doesMatch(role[this.name], mask)
	}

	/**
	 * Generates mask of the permission(s).
	 *
	 * The mask includes the flags of permission dependencies.
	 *
	 * @param names Name of the permission to generate its mask
	 */
	generateMask(...names: U[]): number {
		const { permissions } = this
		return names.reduce((combinedMask, name) => {
			const info: PermissionInfo<U> = permissions.get(name)
				|| {
					"flag": 0,
					"permissionDependencies": []
				}
			return combinedMask
				| info.permissionDependencies.reduce(
					(dependentMask, dependentName) => dependentMask | this.generateMask(dependentName),
					info.flag
				)
		}, 0)
	}

	/**
	 * Generates mask where all permissions are enabled.
	 */
	generateSuperMask(): number {
		return Array.from(this.permissions.values()).reduce(
			(previousMask, permissionInfo) => previousMask | permissionInfo.flag,
			0
		)
	}

	/**
	 * Generates a collection of masks for external permissions.
	 * @param mask The mask to check for external dependencies.
	 */
	generateExternalDependencyInfo(names: U[]): Set<ExternalPermissionDependencyInfo<any, any>> {
		const externalInfos = new Map<string, ExternalPermissionDependencyInfo<any, any>>()

		// Check all permission names that have external permissions
		names.forEach(name => {
			const info = this.permissions.get(name) as PermissionInfo<U>
			if (info.externalPermissionDependencies) {
				// Put all external permission in one external info
				info.externalPermissionDependencies.forEach(externalDependency => {
					const { "name": externalGroupName } = externalDependency.group
					let externalInfo = externalDependency

					if (externalInfos.has(externalGroupName)) {
						externalInfo = externalInfos
						.get(externalGroupName) as ExternalPermissionDependencyInfo<any, any>

						externalInfo.permissionDependencies.push(
							...externalDependency.permissionDependencies
						)
					}

					externalInfos.set(externalGroupName, externalInfo)
				})
			}
		})

		// Remove the duplicate permission names
		const cleanedExternalInfos = new Set<ExternalPermissionDependencyInfo<any, any>>()
		for (const externalInfo of externalInfos.values()) {
			const newExternalInfo: ExternalPermissionDependencyInfo<any, any> = {
				"group": externalInfo.group,
				"permissionDependencies": makeUnique(externalInfo.permissionDependencies)
			}

			cleanedExternalInfos.add(newExternalInfo)
		}

		return cleanedExternalInfos
	}

	/**
	 * Deserialize the flag into permission names.
	 */
	deserialize(flags: number): U[] {
		const { permissions } = this
		const names: U[] = []
		for (const [ key, value ] of permissions.entries()) {
			if (this.doesMatch(flags, value.flag)) {
				names.push(key)
			}
		}

		return names
	}

	/**
	 * Returns true if there is at least one role allowed.
	 *
	 * @param roles Roles available to a certain user.
	 * @param permissionCombinations Possible permission that may a role.
	 */
	hasOneRoleAllowed(roles: T[], permissionCombinations: U[][]): boolean {
		return permissionCombinations.reduce(
			(previousPermittedCombination: boolean, combination: U[]) => {
				// Use logical OR to match one of the permission combinations
				const isAllowed = previousPermittedCombination || roles.reduce((
					previousPermittedRole: boolean,
					role: T
				) => {
					// Use logical OR to match one of the roles
					const hasLocallyAllowed = previousPermittedRole || this.mayAllow(
						role,
						...combination
					)

					return hasLocallyAllowed
				}, false)

				return isAllowed
			}, false
		)
	}

	private doesMatch(flags: number, targetFlag: number): boolean {
		return (flags & targetFlag) === targetFlag
	}
}
