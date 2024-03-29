/* eslint-disable max-classes-per-file */
import type { PermissionMap, PermissionInfo } from "$/types/permission"

import BasePermissionGroup from "./base"

describe("Back-end: Base Permission Group", () => {
	type GroupNameA = { "groupA": number }
	type AvailablePermissionsA = "a" | "b"
	class GroupA extends BasePermissionGroup<GroupNameA, AvailablePermissionsA> {
		get name(): string { return "groupA" }
		get permissions(): PermissionMap<AvailablePermissionsA> {
			return new Map<AvailablePermissionsA, PermissionInfo<AvailablePermissionsA>>([
				[ "a", {
					"flag": 0x1,
					"mask": 0x1,
					"permissionDependencies": []
				} ],
				[ "b", {
					"flag": 0x2,
					"mask": 0x2,
					"permissionDependencies": []
				} ]
			])
		}
	}

	it("can allow using simple permission", () => {
		const permissionGroup = new GroupA()

		const isAllowed = permissionGroup.mayAllow({ "groupA": 0x1 }, "a")

		expect(isAllowed).toBeTruthy()
		expect(permissionGroup.mayAllow({ "groupA": 0x1 }, "b")).toBeFalsy()
	})

	it("can deny using simple permission", () => {
		const permissionGroup = new GroupA()

		const isAllowed = permissionGroup.mayAllow({ "groupA": 0x1 }, "b")

		expect(isAllowed).toBeFalsy()
	})

	type GroupNameB = { "groupB": number }
	type AvailablePermissionsB = "c" | "d"

	class GroupB extends BasePermissionGroup<GroupNameB, AvailablePermissionsB> {
		get name(): string { return "groupB" }
		get permissions(): PermissionMap<AvailablePermissionsB> {
			return new Map<AvailablePermissionsB, PermissionInfo<AvailablePermissionsB>>([
				[ "c", {
					"flag": 0x1,
					"mask": 0x1,
					"permissionDependencies": []
				} ],
				[ "d", {
					"flag": 0x2,
					"mask": 0x2,
					"permissionDependencies": [ "c" ]
				} ]
			])
		}
	}

	it("can allow using dependent permission", () => {
		const permissionGroup = new GroupB()

		const isAllowed = permissionGroup.mayAllow({ "groupB": 0x3 }, "d")
		expect(isAllowed).toBeTruthy()
	})

	it("can deny using dependent permission because itself is not allowed", () => {
		const permissionGroup = new GroupB()

		const isAllowed = permissionGroup.mayAllow({ "groupB": 0x2 }, "d")

		expect(isAllowed).toBeFalsy()
	})

	it("can deny using dependent permission because dependency does not allow", () => {
		const permissionGroup = new GroupB()

		const isAllowed = permissionGroup.mayAllow({ "groupB": 0x1 }, "d")

		expect(isAllowed).toBeFalsy()
	})

	it("can generate mask of simple permission", () => {
		const permissionGroup = new GroupB()

		const mask = permissionGroup.generateFlags("c")

		expect(mask).toBe(0x1)
	})

	it("can generate mask of dependent permission", () => {
		const permissionGroup = new GroupB()

		const mask = permissionGroup.generateFlags("d")

		expect(mask).toBe(0x3)
	})

	it("can generate super mask", () => {
		const permissionGroup = new GroupB()

		const mask = permissionGroup.generateSuperFlags()

		expect(mask).toBe(0x3)
	})

	type GroupNameC = { "groupC": number }
	type AvailablePermissionsC = "e" | "f" | "g"

	class GroupC extends BasePermissionGroup<GroupNameC, AvailablePermissionsC> {
		get name(): string { return "groupC" }
		get permissions(): PermissionMap<AvailablePermissionsC> {
			return new Map<AvailablePermissionsC, PermissionInfo<AvailablePermissionsC>>([
				[ "e", {
					"flag": 0x1,
					"mask": 0x1,
					"permissionDependencies": []
				} ],
				[ "f", {
					"flag": 0x2,
					"mask": 0x2,
					"permissionDependencies": []
				} ],
				[ "g", {
					"flag": 0x4,
					"mask": 0x4,
					"permissionDependencies": []
				} ]
			])
		}
	}

	it("can allow using multiple independent permissions", () => {
		const permissionGroup = new GroupC()

		const isAllowed = permissionGroup.mayAllow({ "groupC": 0x7 }, "e", "f", "g")

		expect(isAllowed).toBeTruthy()
	})

	it("can generate mask of multiple independent permission", () => {
		const permissionGroup = new GroupC()

		const mask = permissionGroup.generateFlags("e", "f", "g")

		expect(mask).toBe(0x7)
	})

	it("can allow at least one role", () => {
		const permissionGroup = new GroupC()
		const roles = [
			{
				"groupC": permissionGroup.generateFlags("e", "f"),
				"name": "A"
			}
		]
		const permissionCombinations: AvailablePermissionsC[][] = [
			[ "e", "f" ]
		]

		const isAllowed = permissionGroup.hasOneRoleAllowed(roles, permissionCombinations)

		expect(isAllowed).toBeTruthy()
	})

	it("can allow at least one role with different combination", () => {
		const permissionGroup = new GroupC()
		const roles = [
			{
				"groupC": permissionGroup.generateFlags("e", "f"),
				"name": "A"
			},
			{
				"groupC": permissionGroup.generateFlags("f", "g"),
				"name": "A"
			}
		]
		const permissionCombinations: AvailablePermissionsC[][] = [
			[ "e", "g" ],
			[ "f", "g" ]
		]

		const isAllowed = permissionGroup.hasOneRoleAllowed(roles, permissionCombinations)

		expect(isAllowed).toBeTruthy()
	})

	it("can deny if no permitted role exists", () => {
		const permissionGroup = new GroupC()
		const roles = [
			{
				"groupC": permissionGroup.generateFlags("e", "f"),
				"name": "A"
			},
			{
				"groupC": permissionGroup.generateFlags("f", "g"),
				"name": "A"
			}
		]
		const permissionCombinations: AvailablePermissionsC[][] = [
			[ "e", "g" ]
		]

		const isAllowed = permissionGroup.hasOneRoleAllowed(roles, permissionCombinations)

		expect(isAllowed).toBeFalsy()
	})

	it("can generate permitted names", () => {
		const permissionGroup = new GroupC()
		const flags = permissionGroup.generateFlags("e", "f")

		const permissionNames = permissionGroup.deserialize(flags)

		expect(permissionNames).toStrictEqual([ "e", "f" ])
	})

	type GroupNameD = { "groupD": number }
	type AvailablePermissionsD = "h" | "i"

	class GroupD extends BasePermissionGroup<GroupNameD, AvailablePermissionsD> {
		get name(): string { return "groupD" }
		get permissions(): PermissionMap<AvailablePermissionsD> {
			return new Map<AvailablePermissionsD, PermissionInfo<AvailablePermissionsD>>([
				[ "h", {
					"externalPermissionDependencies": [
						{
							"group": new GroupC(),
							"permissionDependencies": [ "e" ]
						}
					],
					"flag": 0x1,
					"mask": 0x1,
					"permissionDependencies": []
				} ],
				[ "i", {
					"externalPermissionDependencies": [
						{
							"group": new GroupB(),
							"permissionDependencies": [ "c" ]
						},
						{
							"group": new GroupC(),
							"permissionDependencies": [ "f" ]
						}
					],
					"flag": 0x2,
					"mask": 0x2,
					"permissionDependencies": [ "h" ]
				} ]
			])
		}
	}

	it("can identify required external dependencies", () => {
		const permissionGroup = new GroupD()

		const externalDependencies = permissionGroup.identifyExternalDependencies([ "h", "i" ])

		expect(externalDependencies[0].group).toBeInstanceOf(GroupC)
		expect(externalDependencies).toHaveProperty("0.permissionDependencies.0", "e")
		expect(externalDependencies).toHaveProperty("0.permissionDependencies.1", "f")
		expect(externalDependencies[1].group).toBeInstanceOf(GroupB)
		expect(externalDependencies).toHaveProperty("1.permissionDependencies.0", "c")
	})

	it("can allow with external dependencies", () => {
		const permissionGroup = new GroupD()
		const role = {
			"groupC": new GroupC().generateFlags("e"),
			"groupD": permissionGroup.generateFlags("h"),
			"name": "A"
		}

		const isAllowed = permissionGroup.mayAllow(role, "h")

		expect(isAllowed).toBeTruthy()
	})

	it("can deny with external dependencies", () => {
		const permissionGroup = new GroupD()
		const role = {
			"groupB": 0,
			"groupC": new GroupC().generateFlags("f"),
			"groupD": permissionGroup.generateFlags("i"),
			"name": "A"
		}

		const isAllowed = permissionGroup.mayAllow(role, "i")

		expect(isAllowed).toBeFalsy()
	})

	it("can get dependent permission names", () => {
		const permissionGroup = new GroupD()
		const parentPermissionName = "h"

		const dependentPermissions = permissionGroup.identifyDependents([
			parentPermissionName
		])

		expect(dependentPermissions).toEqual([ "i" ])
	})

	it("can get externally dependent permission names", () => {
		const groupC = new GroupC()
		const permissionGroup = new GroupD()

		const externallyDependentPermissions = permissionGroup.identifyExternallyDependents([
			{
				"group": groupC,
				"permissionDependencies": [ "e" ]
			}
		])

		expect(externallyDependentPermissions).toEqual([ "h", "i" ])
	})

	it("cannot get dependent permission names", () => {
		const permissionGroup = new GroupD()
		const parentPermissionName = "i"

		const dependentPermissions = permissionGroup.identifyDependents([
			parentPermissionName
		])

		expect(dependentPermissions).toEqual([])
	})

	it("cannot get externally dependent permission names", () => {
		const groupC = new GroupC()
		const permissionGroup = new GroupD()

		const externallyDependentPermissions = permissionGroup.identifyExternallyDependents([
			{
				"group": groupC,
				"permissionDependencies": [ "g" ]
			}
		])

		expect(externallyDependentPermissions).toEqual([])
	})

	type GroupNameE = { "groupE": number }
	type AvailablePermissionsE = "j" | "k" | "l" | "m"

	class GroupE extends BasePermissionGroup<GroupNameE, AvailablePermissionsE> {
		get name(): string { return "groupD" }
		get permissions(): PermissionMap<AvailablePermissionsE> {
			return new Map<AvailablePermissionsE, PermissionInfo<AvailablePermissionsE>>([
				[ "j", {
					"externalPermissionDependencies": [
						{
							"group": new GroupD(),
							"permissionDependencies": [ "h" ]
						}
					],
					"flag": 0x1,
					"mask": 0x1,
					"permissionDependencies": []
				} ],
				[ "k", {
					"flag": 0x2,
					"mask": 0x2,
					"permissionDependencies": [ "j" ]
				} ],
				[ "l", {
					"externalPermissionDependencies": [
						{
							"group": new GroupD(),
							"permissionDependencies": [ "i" ]
						}
					],
					"flag": 0x4,
					"mask": 0x4,
					"permissionDependencies": []
				} ],
				[ "m", {
					"flag": 0x8,
					"mask": 0x8,
					"permissionDependencies": [ "k" ]
				} ]
			])
		}
	}

	it("can get transitively dependent permission names", () => {
		const permissionGroup = new GroupE()
		const parentPermissionName = "j"

		const dependentPermissions = permissionGroup.identifyDependents([
			parentPermissionName
		])

		expect(dependentPermissions).toEqual([ "k", "m" ])
	})

	it("can get externally shallowly transitively dependent permission names", () => {
		const groupD = new GroupD()
		const permissionGroup = new GroupE()

		const externallyDependentPermissions = permissionGroup.identifyExternallyDependents([
			{
				"group": groupD,
				"permissionDependencies": [ "h" ]
			}
		])

		expect(externallyDependentPermissions.sort()).toEqual([ "j", "k", "l", "m" ])
	})

	it("can get externally deeply transitively dependent permission names", () => {
		const groupC = new GroupC()
		const permissionGroup = new GroupE()

		const externallyDependentPermissions = permissionGroup.identifyExternallyDependents([
			{
				"group": groupC,
				"permissionDependencies": [ "f" ]
			}
		])

		expect(externallyDependentPermissions).toEqual([ "l" ])
	})
})
