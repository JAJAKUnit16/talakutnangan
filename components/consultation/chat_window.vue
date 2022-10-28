<template>
	<section ref="chatWindow" class="chat-window right">
		<button
			class="toggle-list-btn material-icons"
			title="Toggle consultation list"
			@click="toggleConsultationList">
			{{ `chevron_${isConsultationListShown ? "left" : "right"}` }}
		</button>

		<div class="selected-consultation-header">
			<div class="text">
				<div class="selected-consultation-title">
					{{ consultation.reason }}
				</div>
				<div class="selected-consultation-remaining-time">
					Time remaining:
					<span>{{ remainingTime.minutes }}m</span>
					<span v-if="remainingTime.seconds > 0">{{ remainingTime.seconds }}s</span>
				</div>
				<div class="selected-consultation-user-status">
					<!-- TODO(lead): must base on user active status -->
					User is online
				</div>
			</div>
			<div class="controls">
				<!-- TODO(lead/button): Apply functionality -->
				<button class="material-icons">
					video_camera_back
				</button>
				<button class="material-icons toggle-controls-btn" @click="showFileRepoOverlay">
					storage
				</button>

				<FileOverlay
					:is-file-repo-overlay-shown="isFileRepoOverlayShown"
					:must-show-preview="mustShowPreview"
					@hide-file-repo-overlay="hideFileRepoOverlay"
					@switch-tab="switchTab"/>

				<ExtraControls
					:is-header-control-dropdown-shown="isHeaderControlDropdownShown"
					:is-current-user-consultant="isCurrentUserConsultant"
					@show-action-taken-overlay="showActionTakenOverlay"
					@toggle-header-control-dropdown-shown="toggleHeaderControlDropdownShown"/>

				<Overlay
					:is-shown="isActionTakenOverlayShown && isCurrentUserConsultant"
					class="action-taken"
					@close="hideActionTakenOverlay">
					<template #header>
						Mark this consultation as finished?
					</template>

					<template #default>
						<p>If so, please provide the action taken to solve the consulter/s concern.</p>
						<NonSensitiveTextField
							v-model="actionTaken"
							class="action-taken-field"
							type="text"/>
						<ReceivedErrors
							v-if="receivedErrors.length"
							:received-errors="receivedErrors"/>
					</template>

					<template #footer>
						<button
							class="finish-btn btn btn-primary"
							@click="finishConsultation">
							submit
						</button>
					</template>
				</Overlay>
			</div>
		</div>
		<div class="selected-consultation-chats">
			<div class="selected-consultation-new">
				<p class="consultation-details">
					<strong>This is a new consultation.</strong>
					here are some additional details
				</p>
				<ul class="selected-consultation-additional-details">
					<li>Ticket: {{ consultationID }}</li>
					<li>Status: {{ consultationStatus }}</li>

					<!-- TODO(lead/button): Apply functionality -->
					<li>
						<a
							class="underline"
							href="#"
							@click.prevent="saveAsPDF">
							View printable form (PDF)
						</a>
					</li>
				</ul>
			</div>

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

<style lang="scss">

.additional-controls{
	.dropdown-container{
		inset: unset;
		right: -80px;
	}
}

</style>

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
			@apply fixed opacity-15 hover:opacity-100;
			@apply bg-gray-500 text-light-300 dark:bg-light-300 dark:text-dark-300;
			z-index: 1001;
		}

		.links{
			@apply flex flex-col;
		}

		.selected-consultation-header {
			@apply flex py-4 px-2 dark:bg-true-gray-800;
			.text {
				@apply flex-1;
				.selected-consultation-user-status { @apply row-start-2; }
			}
			.controls { @apply flex items-center; }
		}

		.selected-consultation-chats {
			@apply px-3 py-5 flex-1 overflow-y-scroll;

			.selected-consultation-new{
				@apply flex flex-col items-center justify-center;
			}

			.consultation-details{
				@apply text-center;
			}

			ul.selected-consultation-additional-details {
				@apply bg-true-gray-600 border border-true-gray-600 rounded-md p-5;
				@apply dark:bg-transparent;
				@apply my-5 w-max mx-auto;
			}
		}
	}
</style>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from "vue"

import type { UnitError } from "$/types/server"
import type { PageContext } from "$/types/renderer"
import type { FullTime } from "$@/types/independent"
import type { DeserializedChatMessageListDocument } from "$/types/documents/chat_message"
import type {
	ConsultationAttributes,
	DeserializedConsultationResource
} from "$/types/documents/consultation"


import makeSwitch from "$@/helpers/make_switch"
import ConsultationFetcher from "$@/fetchers/consultation"
import ConsultationTimerManager from "$@/helpers/consultation_timer_manager"
import convertMStoTimeObject from "$@/helpers/convert_milliseconds_to_full_time_object"

import Overlay from "@/helpers/overlay.vue"

import ReceivedErrors from "@/helpers/received_errors.vue"
import NonSensitiveTextField from "@/fields/non-sensitive_text.vue"
import FileOverlay from "@/consultation/chat_window/file_overlay.vue"
import ExtraControls from "@/consultation/chat_window/extra_controls.vue"
import UserController from "@/consultation/chat_window/user_controller.vue"
import ChatMessageItem from "@/consultation/chat_window/chat_message_item.vue"

const fetcher = new ConsultationFetcher()

interface CustomEvents {
	(eventName: "updatedConsultationAttributes", data: ConsultationAttributes<"deserialized">): void
	(eventName: "toggleConsultationList"): void
}

const emit = defineEmits<CustomEvents>()
const props = defineProps<{
	consultation: DeserializedConsultationResource<"consultant"|"consultantRole">
	chatMessages: DeserializedChatMessageListDocument<"user">
	isConsultationListShown: boolean
}>()

const {
	"pageProps": {
		"userProfile": {
			"data": {
				kind
			}
		}
	}
} = inject("pageContext") as PageContext<"deserialized">
const isCurrentUserConsultant = computed(() => kind === "reachable_employee")
const sortedMessagesByTime = computed(() => {
	const { "chatMessages": { "data": rawData } } = props
	return [ ...rawData ].sort((left, right) => {
		const leftSeconds = left.createdAt.valueOf()
		const rightSeconds = right.createdAt.valueOf()

		return Math.sign(leftSeconds - rightSeconds)
	})
})

const chatWindow = ref<HTMLElement|null>(null)
function toggleConsultationList() {
	emit("toggleConsultationList")
}

const {
	"toggle": toggleHeaderControlDropdownShown,
	"state": isHeaderControlDropdownShown
} = makeSwitch(false)

const remainingMilliseconds = ref<number>(0)
const remainingTime = computed<FullTime>(() => convertMStoTimeObject(remainingMilliseconds.value))
const consultation = computed<DeserializedConsultationResource<"consultant"|"consultantRole">>(
	() => props.consultation
)
const consultationID = computed<string>(() => consultation.value.id)
const consultationStatus = computed<string>(() => consultation.value.status)

function restartRemainingTime(): void {
	remainingMilliseconds.value = ConsultationTimerManager.MAX_EXPIRATION_TIME
}

function changeTime(
	unusedResource: DeserializedConsultationResource,
	remainingMillisecondduration: number
): void {
	remainingMilliseconds.value = remainingMillisecondduration
}

const {
	"on": showFileRepoOverlay,
	"off": hideFileRepoOverlay,
	"state": isFileRepoOverlayShown
} = makeSwitch(false)

const {
	"on": showActionTakenOverlay,
	"off": hideActionTakenOverlay,
	"state": isActionTakenOverlayShown
} = makeSwitch(false)
const actionTaken = ref("")


const fileRepoTab = ref("files")
const receivedErrors = ref<string[]>([])

const mustShowPreview = computed(() => fileRepoTab.value === "pictures")
function switchTab(event: Event) {
	const button = event.target as HTMLButtonElement
	const { innerText } = button

	fileRepoTab.value = innerText.toLocaleLowerCase()
}

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

		const expectedDeserializedConsultationResource: DeserializedConsultationResource<
			"consultant"|"consultantRole"
		> = {
			...consultation.value,
			...deserializedConsultationData
		}

		ConsultationTimerManager.unlistenConsultationTimeEvent(
			expectedDeserializedConsultationResource,
			"finish",
			finishConsultation
		)

		fetcher.update(
			consultationID.value,
			newConsultationData,
			{
				"extraDataFields": {
					"relationships": {
						"consultant": {
							"data": {
								"id": consultation.value.consultant.data.id,
								"type": "user"
							}
						}
					}
				},
				"extraUpdateDocumentProps": {
					"meta": {
						"doesAllowConflicts": true
					}
				}
			}
		)
		.then(() => {
			remainingMilliseconds.value = 0
			emit("updatedConsultationAttributes", deserializedConsultationData)
		}).catch(({ body }) => {
			if (body) {
				const { errors } = body
				receivedErrors.value = errors.map((error: UnitError) => {
					const readableDetail = error.detail

					return readableDetail
				})
			} else {
				receivedErrors.value = [ "an error occured" ]
			}
		})
	}
}


function registerListeners(resource: DeserializedConsultationResource): void {
	ConsultationTimerManager.listenConsultationTimeEvent(resource, "finish", finishConsultation)
	ConsultationTimerManager.listenConsultationTimeEvent(
		resource,
		"restartTime",
		restartRemainingTime
	)
	ConsultationTimerManager.listenConsultationTimeEvent(resource, "consumedTime", changeTime)
}

function startConsultation() {
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
					"consultant": {
						"data": {
							"id": consultation.value.consultant.data.id,
							"type": "user"
						}
					}
				}
			},
			"extraUpdateDocumentProps": {
				"meta": {
					"doesAllowConflicts": true
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
			"consultant"|"consultantRole"
		> = {
			...consultation.value,
			...deserializedConsultationData
		}

		registerListeners(expectedDeserializedConsultationResource)

		remainingMilliseconds.value = ConsultationTimerManager.MAX_EXPIRATION_TIME
		emit("updatedConsultationAttributes", deserializedConsultationData)
	})
}


const startWatcher = watch(consultation, (newConsultation, oldConsultation) => {
	if (oldConsultation.startedAt === null && newConsultation.startedAt instanceof Date) {
		registerListeners(newConsultation)

		const finishWatcher = watch(consultation, (
			newFinishedConsultation,
			oldUnfinishedConsultation
		) => {
			if (
				oldUnfinishedConsultation.finishedAt === null
				&& newFinishedConsultation.finishedAt instanceof Date
			) {
				ConsultationTimerManager.forceFinish(newFinishedConsultation)
				ConsultationTimerManager.unlistenConsultationTimeEvent(
					newFinishedConsultation,
					"finish",
					finishConsultation
				)
				finishWatcher()
			}
		})

		startWatcher()
	}
}, { "deep": true })

function saveAsPDF(): void {
	fetcher.requestAsPDF(props.consultation.id).then(({ body }) => {
		console.log(body)
	})
}

onMounted(() => {
	if (props.consultation.startedAt instanceof Date && props.consultation.finishedAt === null) {
		registerListeners(props.consultation)
		ConsultationTimerManager.restartTimerFor(props.consultation)
	}
})
</script>
