import type { Axios } from "axios"
import axios from "axios"

import type { Response } from "$@/types/independent"
import { JSON_API_MEDIA_TYPE } from "!/types/independent"

import RequestEnvironment from "$!/singletons/request_environment"


/**
 * General class to isolate the third-party library used for communicate from the rest of the
 * client-side code.
 */
export default class extends RequestEnvironment {
	private static instance: Axios = axios.create()

	static initialize() {
		if (this.isOnTest) {
			this.instance = axios.create({
				baseURL: "http://localhost:16000/"
			})
		}
	}

	static getJSON(baseURL: string): Promise<Response> {
		return this.instance.request({
			url: baseURL
		})
		.then(response => {
			return {
				body: response.data,
				status: response.status
			}
		})
		.catch(error => {
			return {
				body: error.response.data,
				status: error.response.status
			}
		})
	}

	static postJSON(basePath: string, data: Serializable): Promise<Response> {
		return this.instance.request({
			url: basePath,
			headers: {
				"Content-Type": JSON_API_MEDIA_TYPE,
				"Accept": JSON_API_MEDIA_TYPE
			},
			data
		})
		.then(response => {
			return {
				body: response.data,
				status: response.status
			}
		})
		.catch(error => {
			return {
				body: error.response.data,
				status: error.response.status
			}
		})
	}
}
