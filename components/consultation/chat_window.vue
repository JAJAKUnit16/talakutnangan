<template>
	<section ref="chatWindow" class="chat-window right">
		<button
			class="toggle-list-btn material-icons"
			title="Toggle consultation list"
			@click="toggleConsultationList">
			{{ `chevron_${isConsultationListShown ? "left" : "right"}` }}
		</button>

		<ConsultationHeader
			v-model="actionTaken"
			:consultation="consultation"
			:chat-messages="chatMessages"
			:remaining-time="remainingTime"
			:received-errors="receivedErrors"
			:is-action-taken-overlay-shown="isActionTakenOverlayShown"
			@show-action-taken-overlay="showActionTakenOverlay"
			@hide-action-taken-overlay="hideActionTakenOverlay"
			@cancel-consultation="cancelConsultation"
			@finish-consultation="finishConsultation"/>
		<div ref="selectedConsultationChats" class="selected-consultation-chats">
			<div
				v-if="!isOngoing"
				class="selected-consultation-new">
				<p class="consultation-details">
					<strong>
						This is {{ age }} consultation.
					</strong>
					Here are some additional details.
				</p>
				<ul class="selected-consultation-additional-details">
					<li>Ticket: {{ consultationID }}</li>
					<li>Status: {{ consultationStatus }}</li>
					<li class="scheduled-at">
						Scheduled at: {{ readableScheduledAt }}
					</li>

					<li>
						<a
							v-if="!isCanceled"
							class="underline"
							:href="linkToPrintableForm">
							View printable form (PDF)
						</a>
					</li>
				</ul>
			</div>

			<Suspensible :is-loaded="hasLoadedChatMessages">
				<button
					v-if="mayLoadPreviousMessages"
					class="load-previous-messages-btn btn btn-secondary"
					@click="loadPreviousMessages">
					Load Previous messages
				</button>
			</Suspensible>
			<div
				v-for="(message, i) in sortedMessagesByTime"
				:key="message.id"
				class="chat-entry">
				<ChatMessageItem :chat-message="message" :next-message="sortedMessagesByTime[i+1]"/>
			</div>
		</div>
		<UserController
			:consultation="consultation"
			@start-consultation="startConsultation"
			@save-as-pdf="saveAsPDF"/>
	</section>
</template>

<style scoped lang="scss">
	@import "@styles/btn.scss";
	@import "@styles/mixins.scss";

	.right {
		@apply flex flex-col;
		@apply flex-1;
		border-right: 1px solid hsla(0,0%,0%,0.1);
		position: relative;

		// TODO: find a way to make mixin `useContentBaseHeight` work
		height: calc(100vh - 56px);

		.toggle-list-btn {
			@apply fixed opacity-20 hover:opacity-100;
			@apply bg-dark-500 text-light-300 dark:bg-light-300 dark:text-dark-300;
			z-index: 500;
		}

		.links{
			@apply flex flex-col;
		}

		.selected-consultation-chats {
			@apply px-3 py-5 flex-1 overflow-y-scroll;

			.selected-consultation-new {
				@apply flex flex-col items-center justify-center;
			}

			.consultation-details {
				@apply text-center;
			}

			ul.selected-consultation-additional-details {
				@apply bg-gray-400 bg-opacity-10 border border-gray-400 rounded-md p-5;
				@apply my-5 mx-auto;

				.scheduled-at {
					word-break: normal;
				}
			}
		}
	}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"

import type { FullTime } from "$@/types/independent"
import type { DeserializedChatMessageListDocument } from "$/types/documents/chat_message"
import type {
	DeserializedChatMessageActivityResource
} from "$/types/documents/chat_message_activity"
import type {
	ConsultationAttributes,
	DeserializedConsultationResource
} from "$/types/documents/consultation"

import { CONSULTATION_FORM_PRINT } from "$/constants/template_page_paths"

import makeSwitch from "$@/helpers/make_switch"
import assignPath from "$@/external/assign_path"
import specializePath from "$/helpers/specialize_path"
import ConsultationFetcher from "$@/fetchers/consultation"
import extractAllErrorDetails from "$@/helpers/extract_all_error_details"
import watchConsultation from "@/consultation/listeners/watch_consultation"
import ConsultationTimerManager from "$@/helpers/consultation_timer_manager"
import formatToReadableTime from "$@/helpers/format_to_complete_friendly_time"
import makeConsultationStates from "@/consultation/helpers/make_consultation_states"
import convertMStoTimeObject from "$@/helpers/convert_milliseconds_to_full_time_object"

import Suspensible from "@/helpers/suspensible.vue"
import UserController from "@/consultation/chat_window/user_controller.vue"
import ChatMessageItem from "@/consultation/chat_window/chat_message_item.vue"
import ConsultationHeader from "@/consultation/chat_window/consultation_header.vue"

const fetcher = new ConsultationFetcher()

interface CustomEvents {
	(eventName: "updatedConsultationAttributes", data: ConsultationAttributes<"deserialized">): void
	(eventName: "toggleConsultationList"): void
	(eventName: "loadPreviousMessages"): void
}

const emit = defineEmits<CustomEvents>()
const props = defineProps<{
	consultation: DeserializedConsultationResource<"consultor"|"consultorRole">
	currentConsultationActivity: DeserializedChatMessageActivityResource[]
	chatMessages: DeserializedChatMessageListDocument<"user">
	hasLoadedChatMessages: boolean,
	isConsultationListShown: boolean
}>()

const selectedConsultationChats = ref<HTMLDivElement|null>(null)
const sortedMessagesByTime = computed(() => {
	const { "chatMessages": { "data": rawData } } = props
	return [ ...rawData ].sort((left, right) => {
		const leftSeconds = left.createdAt.valueOf()
		const rightSeconds = right.createdAt.valueOf()

		return Math.sign(leftSeconds - rightSeconds)
	})
})

const chatMessageActivities = computed(() => props.currentConsultationActivity)
watch(chatMessageActivities, () => {
	const height = selectedConsultationChats.value?.clientHeight
	selectedConsultationChats.value?.scrollBy(0, height as number)
}, {
	"flush": "post"
})

const mayLoadPreviousMessages = computed(
	() => props.chatMessages.data.length !== props.chatMessages.meta?.count
)
function loadPreviousMessages() {
	emit("loadPreviousMessages")
}

const chatWindow = ref<HTMLElement|null>(null)
function toggleConsultationList() {
	emit("toggleConsultationList")
}

const consultation = computed<DeserializedConsultationResource<"consultor"|"consultorRole">>(
	() => props.consultation
)
const {
	willSoonStart,
	willStart,
	isOngoing,
	isUrgent,
	isAutoTerminated,
	isCanceled,
	isDone
} = makeConsultationStates(props)
const consultationID = computed<string>(() => consultation.value.id)
const consultationStatus = computed<string>(() => {
	if (willSoonStart.value) return "Will soon start"
	if (willStart.value) return "Will start in a few minutes"
	if (isOngoing.value) return "Ongoing"
	if (isAutoTerminated.value) return "Auto-terminated"
	if (isCanceled.value) return "Canceled"
	if (isDone.value) return "Done"
	return "Error"
})

const remainingMilliseconds = ref<number>(0)
const remainingTime = computed<FullTime>(() => convertMStoTimeObject(remainingMilliseconds.value))

function restartRemainingTime(): void {
	remainingMilliseconds.value = ConsultationTimerManager.MAX_EXPIRATION_TIME
}

function changeTime(
	unusedResource: DeserializedConsultationResource,
	remainingMillisecondduration: number
): void {
	remainingMilliseconds.value = remainingMillisecondduration
}

const receivedErrors = ref<string[]>([])

const age = computed<string>(() => {
	if (consultation.value.finishedAt) return "an old"
	if (consultation.value.deletedAt) return "a canceled"
	return "a new"
})
const actionTaken = ref("")

const {
	"on": showActionTakenOverlay,
	"off": hideActionTakenOverlay,
	"state": isActionTakenOverlayShown
} = makeSwitch(false)
function finishConsultation(): void {
	const { startedAt } = consultation.value

	if (startedAt instanceof Date) {
		const finalActionTaken = actionTaken.value ? actionTaken.value : null
		const newConsultationData: ConsultationAttributes<"serialized"> = {
			"actionTaken": finalActionTaken,
			"deletedAt": consultation.value.deletedAt?.toISOString() ?? null,
			"finishedAt": new Date().toISOString(),
			"reason": consultation.value.reason,
			"scheduledStartAt": consultation.value.scheduledStartAt.toISOString(),
			"startedAt": startedAt.toISOString()
		}

		const deserializedConsultationData: ConsultationAttributes<"deserialized"> = {
			"actionTaken": finalActionTaken,
			"deletedAt": consultation.value.deletedAt ?? null,
			"finishedAt": new Date(newConsultationData.finishedAt as string),
			"reason": consultation.value.reason,
			"scheduledStartAt": consultation.value.scheduledStartAt,
			startedAt
		}

		fetcher.update(
			consultationID.value,
			newConsultationData,
			{
				"extraDataFields": {
					"relationships": {
						"consultor": {
							"data": {
								"id": consultation.value.consultor.data.id,
								"type": "user"
							}
						}
					}
				},
				"extraUpdateDocumentProps": {
					"meta": {
						"doesAllowConflicts": true,
						"mustForceStart": isUrgent.value
					}
				}
			}
		)
		.then(() => {
			remainingMilliseconds.value = 0
			emit("updatedConsultationAttributes", deserializedConsultationData)
			hideActionTakenOverlay()
		})
		.catch(response => extractAllErrorDetails(response, receivedErrors))
	}
}
function cancelConsultation(): void {
	fetcher.archive([ consultationID.value ])
	.then(() => assignPath("/consultation"))
	.catch(response => extractAllErrorDetails(response, receivedErrors))
}

function registerListeners(resource: DeserializedConsultationResource): void {
	ConsultationTimerManager.listenConsultationTimeEvent(resource, "consumedTime", changeTime)
	ConsultationTimerManager.listenConsultationTimeEvent(
		resource,
		"restartTime",
		restartRemainingTime
	)
	ConsultationTimerManager.listenConsultationTimeEvent(resource, "finish", finishConsultation)
}

function startConsultation(forceStart: boolean) {
	const newConsultationData: ConsultationAttributes<"serialized"> = {
		"actionTaken": null,
		"deletedAt": consultation.value.deletedAt?.toISOString() ?? null,
		"finishedAt": null,
		"reason": consultation.value.reason,
		"scheduledStartAt": consultation.value.scheduledStartAt.toISOString(),
		"startedAt": new Date().toISOString()
	}

	fetcher.update(
		consultationID.value,
		newConsultationData,
		{
			"extraDataFields": {
				"relationships": {
					"consultor": {
						"data": {
							"id": consultation.value.consultor.data.id,
							"type": "user"
						}
					}
				}
			},
			"extraUpdateDocumentProps": {
				"meta": {
					"doesAllowConflicts": true,
					"mustForceStart": forceStart
				}
			}
		}
	).then(() => {
		const deserializedConsultationData: ConsultationAttributes<"deserialized"> = {
			"actionTaken": consultation.value.actionTaken,
			"deletedAt": consultation.value.deletedAt ?? null,
			"finishedAt": consultation.value.finishedAt,
			"reason": consultation.value.reason,
			"scheduledStartAt": consultation.value.scheduledStartAt,
			"startedAt": new Date(newConsultationData.startedAt as string)
		}

		const expectedDeserializedConsultationResource: DeserializedConsultationResource<
			"consultor"|"consultorRole"
		> = {
			...consultation.value,
			...deserializedConsultationData
		}

		registerListeners(expectedDeserializedConsultationResource)

		remainingMilliseconds.value = ConsultationTimerManager.MAX_EXPIRATION_TIME
		emit("updatedConsultationAttributes", deserializedConsultationData)
	})
}

watchConsultation(consultation, registerListeners)

const readableScheduledAt = formatToReadableTime(consultation.value.scheduledStartAt)

const linkToPrintableForm = computed<string>(() => specializePath(CONSULTATION_FORM_PRINT, {
	"id": consultationID.value
}))
function saveAsPDF(): void {
	assignPath(linkToPrintableForm.value)
}

onMounted(() => {
	if (props.consultation.startedAt instanceof Date && props.consultation.finishedAt === null) {
		registerListeners(props.consultation)
		ConsultationTimerManager.restartTimerFor(props.consultation)
	}
})
</script>
