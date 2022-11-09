/* eslint-disable max-lines */
import { nextTick } from "vue"
import { shallowMount, flushPromises } from "@vue/test-utils"

import { JSON_API_MEDIA_TYPE } from "$/types/server"
import type { UserListDocument } from "$/types/documents/user"

import { DEBOUNCED_WAIT_DURATION } from "$@/constants/time"

import stringifyQuery from "$@/fetchers/stringify_query"
import RequestEnvironment from "$/singletons/request_environment"

import Component from "./form.vue"
import Stub from "$/singletons/stub"
import convertTimeToMinutes from "$/time/convert_time_to_minutes"

jest.useFakeTimers()

describe.skip("Component: consultation/form", () => {
	describe("Fields population", () => {
		it("can search students", async() => {
			const students = {
				"data": [
					{
						"attributes": {
							"email": "",
							"kind": "student",
							"name": "Student A",
							"prefersDark": true
						},
						"id": "1",
						"type": "user"
					}
				]
			} as UserListDocument

			fetchMock.mockResponseOnce(
				JSON.stringify(students),
				{ "status": RequestEnvironment.status.OK }
			)

			const wrapper = shallowMount<any>(Component, {
				"global": {
					"provide": {
						"pageContext": {
							"pageProps": {
								"userProfile": {
									"data": {
										"id": "1",
										"type": "user"
									}
								}
							}
						}
					},
					"stubs": {
						"Overlay": false,
						"SearchableChip": false
					}
				},
				"props": {
					"isShown": true
				}
			})

			const consulterBox = wrapper.find(".consulters")
			const consulterSearchField = consulterBox.findComponent({
				"name": "NonSensitiveTextField"
			})
			await consulterSearchField.vm.$emit("update:modelValue", students.data[0].attributes.name)
			jest.advanceTimersByTime(DEBOUNCED_WAIT_DURATION)
			await nextTick()

			const castFetch = fetch as jest.Mock<any, any>
			const [ [ firstRequest ] ] = castFetch.mock.calls
			expect(firstRequest).toHaveProperty("method", "GET")
			expect(firstRequest).toHaveProperty("url", `/api/user?${
				stringifyQuery({
					"filter": {
						"department": "*",
						"existence": "exists",
						"kind": "student",
						"role": "*",
						"slug": students.data[0].attributes.name
					},
					"page": {
						"limit": 10,
						"offset": 0
					},
					"sort": [ "name" ]
				})
			}`)
			expect(firstRequest.headers.get("Content-Type")).toBe(JSON_API_MEDIA_TYPE)
			expect(firstRequest.headers.get("Accept")).toBe(JSON_API_MEDIA_TYPE)
		})

		it("can search employees", async() => {
			const roles = {
				"data": [
					{
						"id": 0,
						"name": "Role A"
					}
				]
			}
			const employees = {
				"data": [
					{
						"attributes": {
							"email": "",
							"kind": "reachable_employee",
							"name": "Employee A",
							"prefersDark": true,
							roles
						},
						"id": "2",
						"type": "user"
					}
				]
			}
			const schedules = {
				"data": [
					{
						"attributes": {
							"dayName": "monday",
							"scheduleEnd": convertTimeToMinutes("09:00"),
							"scheduleStart": convertTimeToMinutes("08:00")
						},
						"id": "1",
						"type": "employee_schedule"
					}
				],
				"meta": {
					"count": 1
				}
			}
			fetchMock.mockResponseOnce(
				JSON.stringify(employees),
				{ "status": RequestEnvironment.status.OK }
			)
			fetchMock.mockResponseOnce(
				JSON.stringify(schedules),
				{ "status": RequestEnvironment.status.OK }
			)

			const wrapper = shallowMount<any>(Component, {
				"global": {
					"provide": {
						"pageContext": {
							"pageProps": {
								"userProfile": {
									"data": {
										"id": "1",
										"type": "user"
									}
								}
							}
						}
					},
					"stubs": {
						"Overlay": false,
						"SearchableChip": false,
						"SelectableOptionsField": false
					}
				},
				"props": {
					"isShown": true
				}
			})

			const consultantBox = wrapper.find(".consultant")
			const consultantSearchField = consultantBox.findComponent({
				"name": "NonSensitiveTextField"
			})
			await consultantSearchField.setValue(employees.data[0].attributes.name)
			jest.advanceTimersByTime(DEBOUNCED_WAIT_DURATION)

			const castFetch = fetch as jest.Mock<any, any>
			const [ [ firstRequest ] ] = castFetch.mock.calls
			expect(firstRequest).toHaveProperty("method", "GET")
			expect(firstRequest).toHaveProperty("url", `/api/user?${
				stringifyQuery({
					"filter": {
						"department": "*",
						"existence": "exists",
						"kind": "reachable_employee",
						"role": "*",
						"slug": employees.data[0].attributes.name
					},
					"page": {
						"limit": 10,
						"offset": 0
					},
					"sort": [ "name" ]
				})
			}`)
			expect(firstRequest.headers.get("Content-Type")).toBe(JSON_API_MEDIA_TYPE)
			expect(firstRequest.headers.get("Accept")).toBe(JSON_API_MEDIA_TYPE)

			await flushPromises()
			const employeeChip = wrapper.find(".chip")
			await employeeChip.trigger("click")

			const selectableConsultantRoles = wrapper.find(".consultant-roles")
			const selectableConsultantRolesOptions = selectableConsultantRoles.findAll("option")
			expect(selectableConsultantRoles.exists()).toBeTruthy()
			expect(selectableConsultantRolesOptions[1].element.value).toEqual(String(roles.data[0].id))
		})

		it("should show text field when reason selected is 'others'", async() => {
			const wrapper = shallowMount<any>(Component, {
				"global": {
					"provide": {
						"pageContext": {
							"pageProps": {
								"userProfile": {
									"data": {
										"id": "1",
										"type": "user"
									}
								}
							}
						}
					},
					"stubs": {
						"Overlay": false,
						"SearchableChip": false
					}
				},
				"props": {
					"isShown": true
				}
			})

			const selectableReason = wrapper.findComponent(".reason")
			await selectableReason.setValue("Others")

			const otherReasonField = wrapper.findComponent(".other-reason")
			expect(otherReasonField.exists()).toBeTruthy()
		})

		it("can select within employee's schedules", async() => {
			const roles = {
				"data": [
					{
						"id": 0,
						"name": "Role A"
					}
				]
			}
			const employees = {
				"data": [
					{
						"attributes": {
							"email": "",
							"kind": "reachable_employee",
							"name": "Employee A",
							roles
						},
						"id": "2",
						"type": "user"
					}
				]
			}
			fetchMock.mockResponseOnce(
				JSON.stringify(employees),
				{ "status": RequestEnvironment.status.OK }
			)
			const schedules = {
				"data": [
					{
						"attributes": {
							"dayName": "monday",
							"scheduleEnd": convertTimeToMinutes("09:00"),
							"scheduleStart": convertTimeToMinutes("08:00")
						},
						"id": "1",
						"type": "employee_schedule"
					}
				],
				"meta": {
					"count": 1
				}
			}

			const wrapper = shallowMount<any>(Component, {
				"global": {
					"provide": {
						"pageContext": {
							"pageProps": {
								"userProfile": {
									"data": {
										"id": "1",
										"type": "user"
									}
								}
							}
						}
					},
					"stubs": {
						"Overlay": false,
						"SearchableChip": false,
						"SelectableOptionsField": false
					}
				},
				"props": {
					"isShown": true
				}
			})

			const consultantBox = wrapper.find(".consultant")
			const consultantSearchField = consultantBox.findComponent({
				"name": "NonSensitiveTextField"
			})
			await consultantSearchField.setValue(employees.data[0].attributes.name)
			jest.advanceTimersByTime(DEBOUNCED_WAIT_DURATION)

			fetchMock.mockResponseOnce(
				JSON.stringify(schedules),
				{ "status": RequestEnvironment.status.OK }
			)
			// Display consultant chip
			await flushPromises()
			const employeeChip = wrapper.find(".chip")
			await employeeChip.trigger("click")

			// Load selectable days and its options
			const castedWrapper = wrapper.vm as any
			castedWrapper.dateToday = new Date().setHours(7)
			await flushPromises()
			const selectableDay = wrapper.find(".selectable-day")
			expect(selectableDay.exists()).toBeTruthy()
			const dayOptions = selectableDay.findAll("option")
			expect(dayOptions).toHaveLength(3)

			// Load selectable times and its options
			await flushPromises()
			const selectableDayField = selectableDay.find("select")
			await selectableDayField.setValue(dayOptions[1].attributes("value"))
			const selectableTime = wrapper.find(".selectable-time")
			const timeOptions = selectableTime.findAll("option")
			expect(selectableTime.exists()).toBeTruthy()
			expect(timeOptions.length).toBeGreaterThan(0)

			// Customizable date
			await selectableDayField.setValue(dayOptions[2].attributes("value"))
			expect(selectableTime.exists()).toBeTruthy()
			expect(timeOptions.length).toBeGreaterThan(0)
		})

		it("should eliminate time options", async() => {
			const roles = {
				"data": [
					{
						"id": 0,
						"name": "Role A"
					}
				]
			}
			const employees = {
				"data": [
					{
						"attributes": {
							"email": "",
							"kind": "reachable_employee",
							"name": "Employee A",
							roles
						},
						"id": "2",
						"type": "user"
					}
				]
			}
			fetchMock.mockResponseOnce(
				JSON.stringify(employees),
				{ "status": RequestEnvironment.status.OK }
			)
			const schedules = {
				"data": [
					{
						"attributes": {
							"dayName": "monday",
							"scheduleEnd": convertTimeToMinutes("09:00"),
							"scheduleStart": convertTimeToMinutes("08:00")
						},
						"id": "1",
						"type": "employee_schedule"
					}
				],
				"meta": {
					"count": 1
				}
			}

			const wrapper = shallowMount<any>(Component, {
				"global": {
					"provide": {
						"pageContext": {
							"pageProps": {
								"userProfile": {
									"data": {
										"id": "1",
										"type": "user"
									}
								}
							}
						}
					},
					"stubs": {
						"Overlay": false,
						"SearchableChip": false,
						"SelectableOptionsField": false
					}
				},
				"props": {
					"isShown": true
				}
			})

			const consultantBox = wrapper.find(".consultant")
			const consultantSearchField = consultantBox.findComponent({
				"name": "NonSensitiveTextField"
			})
			await consultantSearchField.setValue(employees.data[0].attributes.name)
			jest.advanceTimersByTime(DEBOUNCED_WAIT_DURATION)

			fetchMock.mockResponseOnce(
				JSON.stringify(schedules),
				{ "status": RequestEnvironment.status.OK }
			)
			// Display consultant chip
			await flushPromises()
			const employeeChip = wrapper.find(".chip")
			await employeeChip.trigger("click")

			// Load selectable days and its options
			await flushPromises()
			const selectableDay = wrapper.find(".selectable-day")
			expect(selectableDay.exists()).toBeTruthy()
			const dayOptions = selectableDay.findAll("option")
			expect(dayOptions).toHaveLength(3)

			// Load selectable times and its options
			const castedWrapper = wrapper.vm as any
			castedWrapper.dateToday = new Date(dayOptions[1].attributes("value") as string)
			castedWrapper.dateToday.setHours(21)
			await flushPromises()
			const selectableDayField = selectableDay.find("select")
			await selectableDayField.setValue(dayOptions[1].attributes("value"))
			const selectedDayIsPast = wrapper.find(".selected-day-is-past")

			// Eliminate options that are after the current hour
			expect(selectedDayIsPast.exists()).toBeTruthy()
		})
	})

	describe("Form submission", () => {
		it("should not submit with incomplete required information", async() => {
			const roles = {
				"data": [
					{
						"id": 1,
						"name": "role"
					}
				]
			}
			const employees = {
				"data": [
					{
						"attributes": {
							"email": "",
							"kind": "reachable_employee",
							"name": "Employee A",
							roles
						},
						"id": "2",
						"type": "user"
					}
				]
			}
			const schedules = {
				"data": [
					{
						"attributes": {
							"dayName": "monday",
							"scheduleEnd": convertTimeToMinutes("09:00"),
							"scheduleStart": convertTimeToMinutes("08:00")
						},
						"id": "1",
						"type": "employee_schedule"
					}
				],
				"meta": {
					"count": 1
				}
			}
			fetchMock.mockResponseOnce(
				JSON.stringify(employees),
				{ "status": RequestEnvironment.status.OK }
			)
			fetchMock.mockResponseOnce(
				JSON.stringify(schedules),
				{ "status": RequestEnvironment.status.OK }
			)
			fetchMock.mockResponseOnce(
				"",
				{ "status": RequestEnvironment.status.NO_CONTENT }
			)

			const wrapper = shallowMount<any>(Component, {
				"global": {
					"provide": {
						"pageContext": {
							"pageProps": {
								"userProfile": {
									"data": {
										"id": "1",
										"type": "user"
									}
								}
							}
						}
					},
					"stubs": {
						"Overlay": false,
						"SearchableChip": false,
						"SelectableOptionsField": false
					}
				},
				"props": {
					"isShown": true
				}
			})

			const [ consultantSearchField ] = wrapper.findAllComponents({
				"name": "NonSensitiveTextField"
			})
			const submitBtn = wrapper.find(".submit-btn")

			await consultantSearchField.setValue(employees.data[0].attributes.name)
			jest.advanceTimersByTime(DEBOUNCED_WAIT_DURATION)
			expect(submitBtn.attributes("disabled")).toBeDefined()

			// Display consultant
			await flushPromises()
			const employeeChip = wrapper.find(".chip")
			await employeeChip.trigger("click")
			const selectableConsultantRoles = wrapper.find(".consultant-roles")
			const selectableConsultantRolesField = selectableConsultantRoles.find("select")
			await selectableConsultantRolesField.setValue(String(roles.data[0].id))
			expect(submitBtn.attributes("disabled")).toBeDefined()

			// Load selectable days and its options
			await flushPromises()
			const selectableDay = wrapper.find(".selectable-day")
			const dayOptions = selectableDay.findAll("option")
			expect(submitBtn.attributes("disabled")).toBeDefined()

			// Load selectable times and its options
			await flushPromises()
			const selectableDayField = selectableDay.find("select")
			await selectableDayField.setValue(dayOptions[1].attributes("value"))
			expect(submitBtn.attributes("disabled")).toBeFalsy()
		})

		it("should submit with other consulters", async() => {
			const roles = {
				"data": [
					{
						"id": 1,
						"name": "role"
					}
				]
			}
			const employees = {
				"data": [
					{
						"attributes": {
							"email": "",
							"kind": "reachable_employee",
							"name": "Employee A",
							roles
						},
						"id": "2",
						"type": "user"
					}
				]
			}
			const schedules = {
				"data": [
					{
						"attributes": {
							"dayName": "monday",
							"scheduleEnd": convertTimeToMinutes("09:00"),
							"scheduleStart": convertTimeToMinutes("08:00")
						},
						"id": "1",
						"type": "employee_schedule"
					}
				],
				"meta": {
					"count": 1
				}
			}
			const students = {
				"data": [
					{
						"attributes": {
							"email": "",
							"kind": "student",
							"name": "Student A",
							"prefersDark": true
						},
						"id": "4",
						"type": "user"
					}
				]
			} as UserListDocument
			fetchMock.mockResponseOnce(
				JSON.stringify(employees),
				{ "status": RequestEnvironment.status.OK }
			)
			fetchMock.mockResponseOnce(
				JSON.stringify(schedules),
				{ "status": RequestEnvironment.status.OK }
			)
			fetchMock.mockResponseOnce(
				JSON.stringify(students),
				{ "status": RequestEnvironment.status.OK }
			)
			fetchMock.mockResponseOnce(
				"",
				{ "status": RequestEnvironment.status.NO_CONTENT }
			)

			const wrapper = shallowMount<any>(Component, {
				"global": {
					"provide": {
						"pageContext": {
							"pageProps": {
								"userProfile": {
									"data": {
										"id": "1",
										"type": "user"
									}
								}
							}
						}
					},
					"stubs": {
						"Overlay": false,
						"SearchableChip": false,
						"SelectableOptionsField": false
					}
				},
				"props": {
					"isShown": true
				}
			})

			const [ consultantSearchField, consulterSearchField ] = wrapper.findAllComponents({
				"name": "NonSensitiveTextField"
			})

			await consultantSearchField.setValue(employees.data[0].attributes.name)
			jest.advanceTimersByTime(DEBOUNCED_WAIT_DURATION)

			// Display consultant
			await flushPromises()
			const employeeChip = wrapper.find(".chip")
			await employeeChip.trigger("click")
			const selectableConsultantRoles = wrapper.find(".consultant-roles")
			const selectableConsultantRolesField = selectableConsultantRoles.find("select")
			await selectableConsultantRolesField.setValue(String(roles.data[0].id))

			// Load selectable days and its options
			await flushPromises()
			const selectableDay = wrapper.find(".selectable-day")
			const dayOptions = selectableDay.findAll("option")

			// Load selectable times and its options
			const castedWrapper = wrapper.vm as any
			castedWrapper.dateToday = new Date().setHours(7)
			await flushPromises()
			const selectableDayField = selectableDay.find("select")
			await selectableDayField.setValue(dayOptions[1].attributes("value"))
			const selectableTime = wrapper.find(".selectable-time")
			const timeOptions = selectableTime.findAll("option")
			const selectableTimeField = selectableTime.find("select")
			await selectableTimeField.setValue(timeOptions[1].attributes("value"))

			await consulterSearchField.setValue(students.data[0].attributes.name)
			jest.advanceTimersByTime(DEBOUNCED_WAIT_DURATION)
			await flushPromises()
			const studentChip = wrapper.find(".chip")
			await studentChip.trigger("click")
			await nextTick()

			const submitBtn = wrapper.find(".submit-btn")
			await submitBtn.trigger("click")
			await flushPromises()

			const previousCalls = Stub.consumePreviousCalls()
			expect(previousCalls).toHaveProperty("0.functionName", "assignPath")
			expect(previousCalls).toHaveProperty("0.arguments.0", "/consultation")
			expect(previousCalls).not.toHaveProperty("0.arguments.1")
		})

		it("should submit without other consulters", async() => {
			const roles = {
				"data": [
					{
						"id": 1,
						"name": "role"
					}
				]
			}
			const employees = {
				"data": [
					{
						"attributes": {
							"email": "",
							"kind": "reachable_employee",
							"name": "Employee A",
							roles
						},
						"id": "2",
						"type": "user"
					}
				]
			}
			const schedules = {
				"data": [
					{
						"attributes": {
							"dayName": "monday",
							"scheduleEnd": convertTimeToMinutes("09:00"),
							"scheduleStart": convertTimeToMinutes("08:00")
						},
						"id": "1",
						"type": "employee_schedule"
					}
				],
				"meta": {
					"count": 1
				}
			}
			fetchMock.mockResponseOnce(
				JSON.stringify(employees),
				{ "status": RequestEnvironment.status.OK }
			)
			fetchMock.mockResponseOnce(
				JSON.stringify(schedules),
				{ "status": RequestEnvironment.status.OK }
			)
			fetchMock.mockResponseOnce(
				"",
				{ "status": RequestEnvironment.status.NO_CONTENT }
			)

			const wrapper = shallowMount<any>(Component, {
				"global": {
					"provide": {
						"pageContext": {
							"pageProps": {
								"userProfile": {
									"data": {
										"id": "1",
										"type": "user"
									}
								}
							}
						}
					},
					"stubs": {
						"Overlay": false,
						"SearchableChip": false,
						"SelectableOptionsField": false
					}
				},
				"props": {
					"isShown": true
				}
			})

			const consultantBox = wrapper.find(".consultant")
			const consultantSearchField = consultantBox.findComponent({
				"name": "NonSensitiveTextField"
			})
			await consultantSearchField.setValue(employees.data[0].attributes.name)
			jest.advanceTimersByTime(DEBOUNCED_WAIT_DURATION)

			// Display consultant
			await flushPromises()
			const employeeChip = wrapper.find(".chip")
			await employeeChip.trigger("click")
			const selectableConsultantRoles = wrapper.find(".consultant-roles")
			const selectableConsultantRolesField = selectableConsultantRoles.find("select")
			await selectableConsultantRolesField.setValue(String(roles.data[0].id))

			// Load selectable days and its options
			await flushPromises()
			const selectableDay = wrapper.find(".selectable-day")
			const dayOptions = selectableDay.findAll("option")

			// Load selectable times and its options
			const castedWrapper = wrapper.vm as any
			castedWrapper.dateToday = new Date().setHours(7)
			await flushPromises()
			const selectableDayField = selectableDay.find("select")
			await selectableDayField.setValue(dayOptions[1].attributes("value"))
			const selectableTime = wrapper.find(".selectable-time")
			const timeOptions = selectableTime.findAll("option")
			const selectableTimeField = selectableTime.find("select")
			await selectableTimeField.setValue(timeOptions[1].attributes("value"))

			const submitBtn = wrapper.find(".submit-btn")
			await submitBtn.trigger("click")
			await flushPromises()

			const previousCalls = Stub.consumePreviousCalls()
			expect(previousCalls).toHaveProperty("0.functionName", "assignPath")
			expect(previousCalls).toHaveProperty("0.arguments.0", "/consultation")
			expect(previousCalls).not.toHaveProperty("0.arguments.1")
		})
	})
})
