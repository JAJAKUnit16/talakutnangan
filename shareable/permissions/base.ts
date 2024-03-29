import type { GeneralObject } from "$/types/general"
import type {
	PermissionMap,
	PermissionInfo,
	ExternalPermissionDependencyInfo
} from "$/types/permission"

import makeUnique from "$/array/make_unique"
import subtractArrays from "$/array/subtract"
import isUndefined from "$/type_guards/is_undefined"

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
		const flags = this.generateFlags(...permissionNames)
		const mask = this.generateMask(...permissionNames)
		const mayAllowedInternally = this.doesMatch(role[this.name], mask, flags)
		const mayAllowedExternally = this.identifyExternalDependencies(permissionNames)
		.reduce((previousGroupApproval, currentExternalInfo) => {
			const approval = previousGroupApproval && currentExternalInfo.group.mayAllow(
				role,
				...currentExternalInfo.permissionDependencies
			)
			return approval
		}, true)

		return mayAllowedInternally && mayAllowedExternally
	}

	/**
	 * Generates flags of the permission(s).
	 *
	 * The flags includes the flags of permission dependencies.
	 *
	 * @param names Name of the permission to generate its flags
	 */
	generateFlags(...names: U[]): number {
		const { permissions } = this
		return names.reduce((combinedMask, name) => {
			const info: PermissionInfo<U> = permissions.get(name)
				|| {
					"flag": 0,
					"mask": 0,
					"permissionDependencies": []
				}
			return combinedMask
				| info.permissionDependencies.reduce(
					(dependentMask, dependentName) => dependentMask | this.generateFlags(dependentName),
					info.flag
				)
		}, 0)
	}

	/**
	 * Generates mask of the permission(s).
	 *
	 * The mask includes the mask of permission dependencies.
	 *
	 * @param names Name of the permission to generate its mask
	 */
	generateMask(...names: U[]): number {
		const { permissions } = this
		return names.reduce((combinedMask, name) => {
			const info: PermissionInfo<U> = permissions.get(name)
				|| {
					"flag": 0,
					"mask": 0,
					"permissionDependencies": []
				}
			return combinedMask
				| info.permissionDependencies.reduce(
					(dependentMask, dependentName) => dependentMask | this.generateMask(dependentName),
					info.mask
				)
		}, 0)
	}

	/**
	 * Generates mask where all permissions are enabled.
	 */
	generateSuperFlags(): number {
		return Array.from(this.permissions.values()).reduce(
			(previousMask, permissionInfo) => previousMask | permissionInfo.flag,
			0
		)
	}

	/**
	 * Generates a collection of information about the external permission group dependency.
	 * @param names The names of the permission names to check.
	 */
	identifyExternalDependencies(names: U[]): ExternalPermissionDependencyInfo<any, any>[] {
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
		const cleanedExternalInfos: ExternalPermissionDependencyInfo<any, any>[] = []
		for (const externalInfo of externalInfos.values()) {
			const newExternalInfo: ExternalPermissionDependencyInfo<any, any> = {
				"group": externalInfo.group,
				"permissionDependencies": makeUnique(externalInfo.permissionDependencies)
			}

			cleanedExternalInfos.push(newExternalInfo)
		}

		return cleanedExternalInfos
	}

	/**
	 * Identify dependencies of permissions names.
	 * @param names Names of the child permissions.
	 */
	identifyDependencies(names: U[]): U[] {
		const { permissions } = this
		const dependencies: U[] = []
		for (const [ key, value ] of permissions.entries()) {
			if (!dependencies.includes(key) && names.includes(key)) {
				const { permissionDependencies } = value
				dependencies.push(
					...permissionDependencies,
					...this.identifyDependencies(permissionDependencies)
				)
			}
		}

		return makeUnique(dependencies)
	}

	/**
	 * Identify permissions names which depend to the specified permissions.
	 * @param names Names of the parent permissions.
	 */
	identifyDependents(names: U[]): U[] {
		const { permissions } = this
		const dependents: U[] = []
		for (const [ key, value ] of permissions.entries()) {
			if (!dependents.includes(key)) {
				const { permissionDependencies } = value
				const differenceLength = subtractArrays(permissionDependencies, names).length
				const originalLength = permissionDependencies.length
				const hasChangedLength = differenceLength < originalLength
				if (hasChangedLength) {
					dependents.push(key, ...this.identifyDependents([ key ]))
				}
			}
		}

		return makeUnique(dependents)
	}

	/**
	 * Identify permissions names which depend to the specified external permissions.
	 * @param externalNames Names of the external parent permissions.
	 *
	 * Note: This does not check transitively.
	 */
	identifyExternallyDependents(externalNames: ExternalPermissionDependencyInfo<any, any>[]): U[] {
		const { permissions } = this
		const dependents: U[] = []

		for (const [ key, value ] of permissions.entries()) {
			const rawPairPermissionDependencies = []
			const rawSimilarPairPermissionDependencies = []
			const rawDissimilarPairPermissionDependencies = []

			const { externalPermissionDependencies } = value
			if (!isUndefined(externalPermissionDependencies)) {
				rawPairPermissionDependencies.push(
					...externalPermissionDependencies.map(
						externalDependency => externalNames
						.map(specifiedDependency => [ externalDependency, specifiedDependency ])
					).flat(1)
				)

				rawSimilarPairPermissionDependencies.push(
					...rawPairPermissionDependencies
					.filter(([ externalDependency, specifiedDependency ]) => {
						const externalName = externalDependency.group.name
						const specifiedName = specifiedDependency.group.name
						return externalName === specifiedName
					})
				)

				rawDissimilarPairPermissionDependencies.push(
					...subtractArrays(
						rawPairPermissionDependencies,
						rawSimilarPairPermissionDependencies
					)
				)
			}

			if (!dependents.includes(key)) {
				for (const [
					externalDependency,
					specifiedDependency
				] of rawSimilarPairPermissionDependencies) {
					const rawOriginal = externalDependency.permissionDependencies
					const rawOriginalDependencies = externalDependency.group
					.identifyDependencies(externalDependency.permissionDependencies)
					const allOriginals = makeUnique([ ...rawOriginal, ...rawOriginalDependencies ])

					const rawTarget = specifiedDependency.permissionDependencies
					const rawTargetDependencies = specifiedDependency.group
					.identifyDependencies(specifiedDependency.permissionDependencies)
					const allTargets = makeUnique([ ...rawTarget, ...rawTargetDependencies ])

					const differenceLength = subtractArrays(allOriginals, allTargets).length
					const originalLength = allOriginals.length
					const hasChangedLength = differenceLength < originalLength
					if (hasChangedLength) {
						dependents.push(key, ...this.identifyDependents([ key ]))
						break
					}
				}
			}

			if (!dependents.includes(key)) {
				const rawDissimilarPermissionDependencies = makeUnique(
					rawDissimilarPairPermissionDependencies
					.map(([ externalDependency ]) => externalDependency)
				)

				for (const externalDependency of rawDissimilarPermissionDependencies) {
					const externalTransitiveDependencies = externalDependency.group
					.identifyDependencies(externalDependency.permissionDependencies)

					const allExternalDependencies = makeUnique([
						...externalDependency.permissionDependencies,
						...externalTransitiveDependencies
					])

					const externallyDependentExternalDependencies = externalDependency.group
					.identifyExternallyDependents(externalNames)

					const differenceLength = subtractArrays(
						allExternalDependencies,
						externallyDependentExternalDependencies
					).length
					const originalLength = allExternalDependencies.length
					const hasChangedLength = differenceLength < originalLength
					if (hasChangedLength) {
						dependents.push(key, ...this.identifyDependents([ key ]))
						break
					}
				}
			}
		}

		return makeUnique(dependents)
	}

	/**
	 * Deserialize the flag into permission names.
	 */
	deserialize(flags: number): U[] {
		const { permissions } = this
		const names: U[] = []
		for (const [ key, value ] of permissions.entries()) {
			if (this.doesMatch(flags, value.mask, value.flag)) {
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
					const hasAllowed = previousPermittedRole || this.mayAllow(
						role,
						...combination
					)

					return hasAllowed
				}, false)

				return isAllowed
			}, false
		)
	}

	private doesMatch(flags: number, targetMask: number, targetFlag: number): boolean {
		return (flags & targetMask) === targetFlag
	}
}
