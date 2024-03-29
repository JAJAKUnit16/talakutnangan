<template>
	<Overlay :is-shown="isOverlayShown" @close="cancel">
		<template #header>
			<h1>Change your password</h1>
		</template>
		<template #default>
			<p class="status-messages warning">
				* You can fully access the website once you change your password.
			</p>
			<ReceivedErrors v-if="receivedErrors.length" :received-errors="receivedErrors"/>
			<ReceivedSuccessMessages
				v-if="successMessages.length"
				:received-success-messages="successMessages"/>
			<form class="verification">
				<SensitiveTextField
					v-model="currentPassword"
					class="field"
					label="Current password"
					placeholder="enter your current password"/>
				<SensitiveTextField
					v-model="newPassword"
					class="field"
					label="New password"
					placeholder="enter your new password"/>
				<SensitiveTextField
					v-model="confirmNewPassword"
					class="field"
					label="Confirm new password"
					placeholder="confirm your new password"/>
			</form>
		</template>
		<template #footer>
			<button
				class="save-btn btn btn-primary"
				type="button"
				@click="savePassword">
				Save password
			</button>
		</template>
	</Overlay>
</template>

<style lang="scss">

	.overlay-footer {
		@apply flex-row-reverse;
	}
</style>

<style scoped lang="scss">
	@import "@styles/btn.scss";
	@import "@styles/status_messages.scss";

	.verification {
		@apply flex flex-col text-black;
		@apply dark:text-light-500;

		label {
			padding: .5em 1em;

			input {
				padding: .25em .5em;
			}
		}

		.field {
			@apply mb-8;
		}
	}
</style>

<script setup lang="ts">
import { ref, inject, onMounted, Ref } from "vue"

import type { PageContext } from "$/types/renderer"

import { BODY_CLASSES } from "$@/constants/provided_keys"
import { MILLISECOND_IN_A_SECOND } from "$/constants/numerical"

import Fetcher from "$@/fetchers/user"
import debounce from "$@/helpers/debounce"
import makeSwitch from "$@/helpers/make_switch"
import isUndefined from "$/type_guards/is_undefined"
import BodyCSSClasses from "$@/external/body_css_classes"
import fillSuccessMessages from "$@/helpers/fill_success_messages"
import extractAllErrorDetails from "$@/helpers/extract_all_error_details"


import Overlay from "@/helpers/overlay.vue"
import SensitiveTextField from "@/fields/sensitive_text.vue"
import ReceivedErrors from "@/helpers/message_handlers/received_errors.vue"
import ReceivedSuccessMessages from "@/helpers/message_handlers/received_success_messages.vue"

const pageContext = inject("pageContext") as PageContext<"deserialized">
const { pageProps } = pageContext
const { userProfile } = pageProps

const {
	"off": closeDialog,
	"on": openDialog,
	"state": isOverlayShown
} = makeSwitch(false)
const currentPassword = ref<string>("")
const newPassword = ref<string>("")
const confirmNewPassword = ref<string>("")

const fetcher: Fetcher = new Fetcher()
const bodyClasses = inject(BODY_CLASSES) as Ref<BodyCSSClasses>

function clearPasswords() {
	[
		currentPassword,
		newPassword,
		confirmNewPassword
	].forEach(password => {
		password.value = ""
	})

	if (!isUndefined(window)) bodyClasses.value.scroll(true)
}

const receivedErrors = ref<string[]>([])
const successMessages = ref<string[]>([])
const openDialogAsynchronously = debounce(() => {
	openDialog()
	if (!isUndefined(window)) bodyClasses.value.scroll(false)
}, MILLISECOND_IN_A_SECOND)
function cancel(): void {
	receivedErrors.value = []
	successMessages.value = []
	clearPasswords()
	closeDialog()
}
function savePassword() {
	fetcher.updatePassword(
		userProfile.data.id,
		currentPassword.value,
		newPassword.value,
		confirmNewPassword.value
	)

	.then(() => {
		fillSuccessMessages(receivedErrors, successMessages)
		openDialogAsynchronously()
	})
	.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))
}

onMounted(() => {
	if (userProfile.meta.hasDefaultPassword) {
		openDialogAsynchronously()
	}
})
</script>
