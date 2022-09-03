import type { GeneralObject } from "$/types/general"

import RequestEnvironment from "$/helpers/request_environment"

type PreviousCallInfo = { functionName: string, arguments: GeneralObject<any> }

/**
 * Handler for stubbed mechnisms to spy on procedures.
 *
 * Based from `Socket` sinfgleton in server.
 */
export default class Stub extends RequestEnvironment {
	private static previousCallInfos: (PreviousCallInfo|undefined)[] = []

	static consumePreviousCalls(): PreviousCallInfo[] {
		return this.runConditionally(
			(): PreviousCallInfo[] => {
				throw new Error(
					"Stubber cannot monitor previous calls in non-test environment."
				)
			},
			() => {
				const previousCalls = this.previousCallInfos.filter(Boolean) as PreviousCallInfo[]
				this.previousCallInfos = []
				// eslint-disable-next-line no-undefined
				return [ previousCalls, undefined ]
			}
		)
	}

	static runConditionally<T = void>(
		liveMechanism: () => T,
		testMechanism: () => [T, PreviousCallInfo|undefined]
	): T {
		if (this.isOnTest) {
			const [ valueToReturn, callInfo ] = testMechanism()
			this.previousCallInfos.push(callInfo)
			return valueToReturn
		}

		return liveMechanism()
	}
}
