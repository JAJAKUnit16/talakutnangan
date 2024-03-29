import { nextTick } from "vue"
import { shallowMount, flushPromises } from "@vue/test-utils"

import type { DeserializedPostResource } from "$/types/documents/post"
import type { DeserializedUserDocument } from "$/types/documents/user"
import type { DeserializedRoleDocument } from "$/types/documents/role"

import { JSON_API_MEDIA_TYPE } from "$/types/server"
import { POST_LINK } from "$/constants/template_links"

import specializePath from "$/helpers/specialize_path"
import RequestEnvironment from "$/singletons/request_environment"

import PermissionGroup from "$/permissions/post"
import {
	ARCHIVE_AND_RESTORE_PERSONAL_POST_ON_OWN_DEPARTMENT
} from "$/permissions/post_combinations"

import Component from "./viewer.vue"

jest.useFakeTimers()
describe("Component: post/viewer", () => {
	it("should request for archiving the post", async() => {
		const userID = "1"
		const postID = "2"
		const roleID = "3"
		const modelValue = {
			"content": "Hello world!",
			"createdAt": new Date(),
			"deletedAt": null,
			"id": postID,
			"poster": {
				"data": {
					"id": userID,
					"type": "user"
				}
			} as DeserializedUserDocument<"roles">,
			"posterRole": {
				"data": {
					"id": roleID,
					"type": "role"
				}
			} as DeserializedRoleDocument,
			"type": "post",
			"updatedAt": new Date()
		} as DeserializedPostResource<"poster"|"posterRole">
		fetchMock.mockResponseOnce("", { "status": RequestEnvironment.status.NO_CONTENT })
		const wrapper = shallowMount<any>(Component, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							"userProfile": {
								"data": {
									"id": userID,
									"roles": {
										"data": [
											{
												"id": "1",
												"postFlags": new PermissionGroup().generateFlags(
													...ARCHIVE_AND_RESTORE_PERSONAL_POST_ON_OWN_DEPARTMENT
												)
											}
										]
									},
									"type": "user"
								}
							}
						}
					}
				},
				"stubs": {
					"Overlay": false
				}
			},
			"props": {
				"commentCount": 0,
				"mayHaveMenu": true,
				modelValue
			}
		})

		const menu = wrapper.findComponent({ "name": "Menu" })
		await menu.vm.$emit("archivePost")
		await nextTick()
		const confirmButton = wrapper.find(".btn-primary")
		await confirmButton.trigger("click")
		await flushPromises()

		const castWrapper = wrapper.vm as any
		expect(castWrapper.mustArchive).toBeTruthy()
		const castFetch = fetch as jest.Mock<any, any>
		expect(castFetch).toHaveBeenCalledTimes(1)
		const [ [ request ] ] = castFetch.mock.calls
		expect(request).toHaveProperty("method", "DELETE")
		expect(request).toHaveProperty("url", specializePath(POST_LINK.unbound, {}))
		expect(request.headers.get("Content-Type")).toBe(JSON_API_MEDIA_TYPE)
		expect(request.headers.get("Accept")).toBe(JSON_API_MEDIA_TYPE)
		const expectedBody = {
			"data": [
				{
					"id": postID,
					"type": "post"
				}
			]
		}
		const TIMEOUT = 3000
		jest.advanceTimersByTime(TIMEOUT)
		expect(await request.json()).toStrictEqual(expectedBody)
		const archiveEvent = wrapper.emitted("archive")
		expect(archiveEvent).toHaveProperty("0.0", modelValue)
	})
})
