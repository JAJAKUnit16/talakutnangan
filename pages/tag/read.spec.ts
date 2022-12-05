import { mount } from "@vue/test-utils"

import { TAG_LINK } from "$/constants/template_links"
import specializePath from "$/helpers/specialize_path"
import RequestEnvironment from "$/singletons/request_environment"

import { UPDATE } from "$/permissions/tag_combinations"
import { tag as permissionGroup } from "$/permissions/permission_list"

import Page from "./read.page.vue"

describe("Page: tag/read", () => {
	it("can update tag information", async() => {
		fetchMock.mockResponseOnce("", { "status": RequestEnvironment.status.NO_CONTENT })

		const tag = {
			"data": {
				"id": "0",
				"name": "Tagexample1"
			}
		}
		const updatedTag = {
			"data": {
				"name": "Xmaple"
			}
		}
		const wrapper = mount(Page, {
			"global": {
				"provide": {
					"pageContext": {
						"pageProps": {
							tag,
							"userProfile": {
								"data": {
									"roles": {
										"data": [
											{
												"name": "A",
												"tagFlags": permissionGroup.generateFlags(...UPDATE)
											}
										]
									}
								}
							}
						}
					}
				}
			}
		})

		const nameInput = wrapper.find(".name input")
		const submitBtn = wrapper.find("button[type=submit]")

		await nameInput.setValue(updatedTag.data.name)
		await submitBtn.trigger("submit")


		const castFetch = fetch as jest.Mock<any, any>
		const [ [ request ] ] = castFetch.mock.calls
		expect(request).toHaveProperty("method", "PATCH")
		expect(request).toHaveProperty("url", specializePath(TAG_LINK.bound, {
			"id": tag.data.id
		}))

		const body = await request.json()
		expect(body).toHaveProperty("data.attributes.name", updatedTag.data.name)
	})
})
