import { Ref } from "vue"

import type {
	ConsultationResource,
	DeserializedConsultationDocument,
	DeserializedConsultationResource,
	DeserializedConsultationListDocument
} from "$/types/documents/consultation"

import Socket from "$@/external/socket"
import deserialize from "$/object/deserialize"
import makeConsultationNamespace from "$/namespace_makers/consultation"
import makeConsultationListOfUserNamespace from "$/namespace_makers/consultation_list_of_user"

export default function(
	consultation: Ref<DeserializedConsultationResource<"consultor"|"consultorRole">>,
	consultations: Ref<DeserializedConsultationListDocument<"consultor"|"consultorRole">>,
	userID: string
) {
	function updateConsultation(updatedConsultation: ConsultationResource<"read">): void {
		const deserializedConsultation = deserialize(
			updatedConsultation
		) as DeserializedConsultationDocument<"read">

		consultation.value = {
			...consultation.value,
			...deserializedConsultation.data
		}

		consultations.value = {
			...consultations.value,
			"data": [
				consultation.value,
				...consultations.value.data.filter(
					consultationItem => consultationItem.id !== consultation.value.id
				)
			]
		}
	}

	const consultationNamespace = makeConsultationNamespace(consultation.value.id)
	Socket.addEventListeners(consultationNamespace, {
		"update": updateConsultation
	})

	function createConsultation(newConsultation: ConsultationResource<"read">): void {
		const deserializedConsultation = deserialize(
			newConsultation
		) as DeserializedConsultationDocument<"read">

		consultations.value = {
			...consultations.value,
			"data": [
				...consultations.value.data,
				deserializedConsultation.data as unknown as DeserializedConsultationResource<
					"consultor"|"consultorRole"
				>
			]
		}
	}

	const consultationListOfUserNamespace = makeConsultationListOfUserNamespace(userID)
	Socket.addEventListeners(consultationListOfUserNamespace, {
		"create": createConsultation
	})
}
