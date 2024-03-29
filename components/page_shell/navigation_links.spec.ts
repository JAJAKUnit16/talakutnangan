import { ref } from "vue"

import { shallowMount } from "@vue/test-utils"

import { BODY_CLASSES } from "$@/constants/provided_keys"

import RoleSpecificLinks from "./navigation_links.vue"

describe("Component: Page Shell/Role Specific Links", () => {
	it("should specify the right link/s for authenticated user", () => {
		const wrapper = shallowMount(RoleSpecificLinks, {
			"global": {
				"provide": {
					[BODY_CLASSES]: ref<string[]>([ "dark" ]),
					"pageContext": {
						"pageProps": {
							"parsedUnitError": {},
							"userProfile": {
								"data": {
									"id": 1,
									"kind": "student",
									"roles": {
										"data": []
									},
									"type": "user"
								}
							}
						}
					}
				},
				"stubs": {
					"RoleLinksList": false
				}
			}
		})
		const link = wrapper.find("anchor-stub:first-of-type")
		const linkHref = link.attributes("href")

		expect(linkHref).toBe("/forum")
	})

	it("should specify the right link/s for a guest user", () => {
		const wrapper = shallowMount(RoleSpecificLinks, {
			"global": {
				"provide": {
					[BODY_CLASSES]: ref<string[]>([ "dark" ]),
					"pageContext": {
						"pageProps": {
							"parsedUnitError": {},
							"userProfile": null
						}
					}
				},
				"stubs": {
					"RoleLinksList": false
				}
			}
		})
		const link = wrapper.find("anchor-stub:first-of-type")
		const linkHref = link.attributes("href")

		expect(linkHref).toBe("/user/log_in")
	})

	it("should appear different in desktop", () => {
		const wrapper = shallowMount(RoleSpecificLinks, {
			"global": {
				"provide": {
					[BODY_CLASSES]: ref<string[]>([ "dark" ]),
					"pageContext": {
						"pageProps": {
							"parsedUnitError": {},
							"userProfile": {
								"data": {
									"id": 1,
									"kind": "student",
									"roles": {
										"data": []
									},
									"type": "user"
								}
							}
						}
					}
				},
				"stubs": {
					"RoleLinksList": false
				}
			}
		})

		const desktopLinks = wrapper.findAll("anchor-stub")
		expect(desktopLinks.length).toBeGreaterThan(1)
	})
})
