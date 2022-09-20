import type { GeneralObject } from "$/types/general"
import type { DeserializedConsultationResource } from "$/types/documents/consultation"

export type SocketListeners = GeneralObject<(...parameters: any[]) => void>

export type ConsultationListeners = {
	"finish": ((consultation: DeserializedConsultationResource) => void)[]
}

interface TimerListener extends ConsultationListeners {
	"consultation": DeserializedConsultationResource,
	"remainingMillisecondsBeforeInactivity": number,
	"listeners": ConsultationListeners
}

export type TimerListeners = TimerListener[]
