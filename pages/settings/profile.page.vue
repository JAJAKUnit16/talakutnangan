<template>
	<SettingsHeader title="User Settings" :tab-infos="settingsTabInfos"/>

	<ReceivedErrors v-if="receivedErrors.length" :received-errors="receivedErrors"/>
	<ReceivedSuccessMessages
		v-if="successMessages.length"
		:received-success-messages="successMessages"/>
	<div class="profile-settings">
		<div class="general-profile-info">
			<h3>General Profile Info</h3>
			<div>
				<TextualField
					v-model="userProfileData.name"
					v-model:status="nameFieldStatus"
					label="Display Name"
					class="display-name-field"
					type="text"/>
			</div>
		</div>

		<div class="pictures">
			<Suspensible :is-loaded="isProfilePictureLoaded">
				<PicturePicker
					resource-type="profile_picture"
					:disabled="mayEditProfile"
					@submit-file="submitProfilePicture">
					<div class="content">
						<div class="picture-picker-header">
							<h3>
								Profile Picture
							</h3>
						</div>

						<label
							for="input-profile-picture"
							class="upload-btn input-profile-picture">
							<span class="material-icons">add_circle</span>
							<small class="upload-replace">
								upload or replace image
							</small>
						</label>
					</div>

					<ProfilePicture class="profile-picker-sm"/>
				</PicturePicker>
			</Suspensible>

			<Suspensible :is-loaded="isSignatureLoaded">
				<PicturePicker
					v-if="!isUnReachableEmployee"
					resource-type="signature"
					:disabled="mayEditProfile"
					@submit-file="submitSignature">
					<div class="content">
						<div class="picture-picker-header">
							<h3>
								Signature
							</h3>
						</div>

						<label
							for="input-signature"
							class="upload-btn input-signature">
							<span class="material-icons">add_circle</span>
							<small class="upload-replace signatures">
								upload or replace image
							</small>
						</label>
					</div>

					<Signature class="signature-picker-sm"/>
				</PicturePicker>
			</Suspensible>
		</div>

		<div class="dark-mode-toggle">
			<h3>
				Dark Mode
			</h3>
			<p class="name">
				Click to toggle dark mode
			</p>
			<label for="dark-mode-toggle">
				<span class="material-icons-outlined">
					{{ `toggle_${prefersDark ? "on" : "off"}` }}
				</span>
				<input
					id="dark-mode-toggle"
					v-model="prefersDark"
					:disabled="!mayEditProfile"
					type="checkbox"
					name=""
					@click="toggleDarkMode"/>
			</label>
			<button class="submit-btn btn btn-primary mt-4 mb-8" @click="updateUser">
				Save changes
			</button>
		</div>

		<div v-if="isReachableEmployee" class="consultation-schedules">
			<h3>
				Consultation Schedules
			</h3>
			<div class="days">
				<SchedulePickerGroup
					v-for="day in DayValues"
					:key="day"
					:disabled="!mayEditProfile"
					:day-name="day"
					:schedules="schedules"/>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.wrapper {
		margin-bottom: 15vh !important;
	}
</style>

<style scoped lang="scss">
	@import "@styles/btn.scss";
	form {
		max-width: 640px;

		.input-pic {
			display: none;
		}
	}

	.profile-settings{
		@apply flex flex-col;

		.general-profile-info {
			@apply mb-8;

			h3 {
				@apply mb-8;
			}
		}

		.pictures {
			@screen md {
				@apply flex justify-between;
			}
		}

		.consultation-schedules {
			@apply mt-16;

			.days {
				@apply flex flex-wrap justify-center;

				> * {
					@apply flex-1 mx-2;
					flex-basis: calc(100% / 3 - 1rem);
				}
			}
		}
	}

	.content {
		@apply flex flex-col sm:flex-row my-7;
	}

	h3 {
		@apply text-xl;
	}

	.input-profile-picture {
		@apply flex flex items-center sm:ml-4;
	}
	.input-signature {
		@apply flex flex items-center sm:ml-4 sm: ml-14;
	}

	.upload-btn {
		cursor: pointer;

		.upload-replace{
			@apply text-center ml-1;

			&:hover {
				@apply underline;
			}
		}
	}

	.profile-picker-sm, .signature-picker-sm{
		@apply flex flex-row sm:flex-row max-w-30;
	}

	.dark-mode-toggle {
		@apply py-5 grid;
		grid-template:
			"formHeader formHeader"
			"subtitle toggle";

		h3 {
			grid-area: formHeader;
		}

		h5 {
			grid-area: subtitle;
		}

		label {
			@apply flex flex-row-reverse;
			cursor: pointer;

			input {
				appearance: none;
			}
		}
	}

	.display-name{
		@apply flex flex-col;
		font-size: large;
	}
</style>

<script setup lang="ts">
import { ref, Ref, inject, computed } from "vue"

import { DayValues } from "$/types/database"
import type { FieldStatus } from "@/fields/types"
import type { PageContext } from "$/types/renderer"
import type { DeserializedEmployeeScheduleResource } from "$/types/documents/employee_schedule"

import { BODY_CLASSES } from "$@/constants/provided_keys"
import settingsTabInfos from "@/settings/settings_tab_infos"
import { user as permissionGroup } from "$/permissions/permission_list"
import {
	UPDATE_OWN_DATA,
	UPDATE_ANYONE_ON_OWN_DEPARTMENT,
	UPDATE_ANYONE_ON_ALL_DEPARTMENTS
} from "$/permissions/user_combinations"

import UserFetcher from "$@/fetchers/user"
import assignPath from "$@/external/assign_path"
import SignatureFetcher from "$@/fetchers/signature"
import BodyCSSClasses from "$@/external/body_css_classes"
import ProfilePictureFetcher from "$@/fetchers/profile_picture"
import RequestEnvironment from "$/singletons/request_environment"
import fillSuccessMessages from "$@/helpers/fill_success_messages"
import extractAllErrorDetails from "$@/helpers/extract_all_error_details"

import Signature from "@/helpers/signature.vue"
import Suspensible from "@/helpers/suspensible.vue"
import PicturePicker from "@/fields/picture_picker.vue"
import TextualField from "@/fields/non-sensitive_text.vue"
import ProfilePicture from "@/helpers/profile_picture.vue"
import SettingsHeader from "@/helpers/tabbed_page_header.vue"
import SchedulePickerGroup from "@/settings/schedule_picker_group.vue"
import ReceivedErrors from "@/helpers/message_handlers/received_errors.vue"
import ReceivedSuccessMessages from "@/helpers/message_handlers/received_success_messages.vue"

const bodyClasses = inject(BODY_CLASSES) as Ref<BodyCSSClasses>
const pageContext = inject("pageContext") as PageContext<"deserialized">

const { pageProps } = pageContext
const { userProfile } = pageProps
const userProfileData = ref(userProfile.data)
const isReachableEmployee = computed(() => userProfileData.value.kind === "reachable_employee")
const isUnReachableEmployee = computed(() => userProfileData.value.kind === "unreachable_employee")


const mayEditProfile = computed<boolean>(() => {
	const isPermitted = permissionGroup.hasOneRoleAllowed(userProfile.data.roles.data, [
		UPDATE_OWN_DATA,
		UPDATE_ANYONE_ON_OWN_DEPARTMENT,
		UPDATE_ANYONE_ON_ALL_DEPARTMENTS
	])

	return isPermitted
})

const nameFieldStatus = ref<FieldStatus>(mayEditProfile.value ? "enabled" : "disabled")

const receivedErrors = ref<string[]>([])
const successMessages = ref<string[]>([])

if (pageContext.pageProps.parsedUnitError) {
	receivedErrors.value = [ pageContext.pageProps.parsedUnitError.detail ]
}

const isProfilePictureLoaded = ref(true)
const submitMessage = "Please submit the changes."
async function submitProfilePicture(formData: FormData) {
	isProfilePictureLoaded.value = false

	const profilePictureFetcher = new ProfilePictureFetcher()
	if (userProfileData.value.profilePicture) {
		await profilePictureFetcher.updateFile(
			userProfileData.value.profilePicture.data.id,
			formData
		)
		.then(() => {
			fillSuccessMessages(
				receivedErrors,
				successMessages,
				`Profile picture uploaded successfully. ${submitMessage}`
			)
		})
		.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))
	} else {
		await profilePictureFetcher.createFile(
			userProfileData.value.id,
			formData
		)
		.then(() => {
			fillSuccessMessages(receivedErrors, successMessages)
		})
		.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))
	}

	isProfilePictureLoaded.value = true
}

const isSignatureLoaded = ref(true)
async function submitSignature(formData: FormData) {
	isSignatureLoaded.value = false

	const signatureFetcher = new SignatureFetcher()
	await signatureFetcher.renew(
		userProfileData.value.id,
		formData
	)
	.then(() => {
		fillSuccessMessages(
			receivedErrors,
			successMessages,
			`Signature uploaded successfully. ${submitMessage}`
		)
	})
	.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))

	isSignatureLoaded.value = true
}

function updateUser() {
	new UserFetcher().update(userProfileData.value.id, {
		"deletedAt": null,
		"email": userProfileData.value.email,
		"emailVerifiedAt": null,
		"kind": userProfileData.value.kind,
		"name": userProfileData.value.name,
		"prefersDark": userProfileData.value.prefersDark ? userProfileData.value.prefersDark : false
	})
	.then(() => {
		fillSuccessMessages(receivedErrors, successMessages)
		const SECONDS_BEFORE_PAGES_RELOAD = 3000
		setTimeout(() => assignPath("/settings/profile"), SECONDS_BEFORE_PAGES_RELOAD)
	})
	.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))
}

const emit = defineEmits([ "toggleDarkMode" ])

const prefersDark = ref(userProfileData.value.prefersDark)
function toggleDarkMode() {
	if (RequestEnvironment.isOnTest) {
		emit("toggleDarkMode")
	}

	const mutatedBodyClasses = new Set([ ...bodyClasses.value.bodyClasses ])
	if (mutatedBodyClasses.has("dark")) {
		bodyClasses.value.lighten()
	} else {
		bodyClasses.value.darken()
	}

	userProfileData.value.prefersDark = !userProfileData.value.prefersDark
}

const schedules = userProfile.data.employeeSchedules?.data as DeserializedEmployeeScheduleResource[]
</script>
