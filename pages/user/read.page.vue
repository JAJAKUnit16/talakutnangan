<template>
	<ListRedirector resource-type="user"/>
	<ReceivedErrors v-if="receivedErrors.length" :received-errors="receivedErrors"/>
	<ReceivedSuccessMessages
		v-if="successMessages.length"
		:received-success-messages="successMessages"/>
	<form
		class="user-data-form"
		@submit.prevent="updateUser">
		<h1 class="user-data-form-header">
			General User data
		</h1>
		<div class="field user-name">
			<NonSensitiveTextField
				v-model="user.data.name"
				v-model:status="textFieldStatus"
				label="User Name"
				type="text"/>
		</div>
		<div class="field email">
			<NonSensitiveTextField
				v-model="user.data.email"
				v-model:status="textFieldStatus"
				:label="emailVerified"
				type="text"/>
		</div>
		<div class="field kind">
			<NonSensitiveTextField
				:model-value="friendlyKind"
				status="disabled"
				label="Kind"
				type="text"/>
		</div>
		<div v-if="isCurrentlyStudent" class="field student-number">
			<NonSensitiveTextField
				:model-value="studentNumber"
				status="disabled"
				label="Student Number"
				type="text"/>
		</div>
		<Suspensible :is-loaded="hasSubmittedUser">
			<button
				v-if="mayUpdateUser"
				type="submit"
				class="update-user-btn btn btn-primary"
				@click="updateUser">
				update user
			</button>
		</Suspensible>
	</form>

	<div
		v-if="isReachableEmployee"
		class="user-data-form">
		<h1 class="user-data-form-header">
			Consultation Schedules
		</h1>
		<div class="days">
			<SchedulePickerGroup
				v-for="day in DayValues"
				:key="day"
				:disabled="!mayUpdateUser"
				:day-name="day"
				:schedules="schedules"/>
		</div>
	</div>

	<div class="related-data">
		<form
			v-if="mayUpdateAttachedRoles"
			class="user-data-form"
			@submit.prevent="updateRoles">
			<h1 class="user-data-form-header">
				Attached Roles
			</h1>
			<div class="roles">
				<MultiSelectableOptionsField
					v-model="userRoleIDs"
					class="selectable-roles"
					:disabled="isDeleted"
					label="Roles"
					:options="selectableRoles"/>
			</div>
			<Suspensible :is-loaded="hasSubmittedRole">
				<button
					v-if="mayUpdateUser"
					type="submit"
					class="update-roles-btn btn btn-primary"
					@click="updateRoles">
					update roles
				</button>
			</Suspensible>
		</form>

		<form
			class="user-data-form"
			@submit.prevent="updateDepartment">
			<h1 class="user-data-form-header">
				Department
			</h1>
			<div class="department">
				<SelectableOptionsField
					v-model="userDepartment"
					class="selectable-department"
					:disabled="isDeleted"
					label="Department"
					:options="selectableDepartments"/>
			</div>
			<Suspensible :is-loaded="hasSubmittedDepartment">
				<button
					v-if="mayUpdateUser"
					type="submit"
					class="update-department-btn btn btn-primary"
					@click="updateDepartment">
					update department
				</button>
			</Suspensible>
		</form>
	</div>

	<Suspensible :is-loaded="hasPerformedWholeChange">
		<div class="controls flex justify-between mt-3">
			<button
				v-if="mayRestoreUser"
				type="button"
				class="btn btn-primary"
				@click="restoreUser">
				Restore
			</button>
			<button
				v-if="mayArchiveUser"
				type="button"
				class="btn btn-primary"
				@click="archiveUser">
				Archive
			</button>
			<button
				v-if="mayResetPassword"
				type="button"
				class="btn btn-primary"
				@click="resetUserPassword">
				Reset Password
			</button>
		</div>
	</Suspensible>
</template>

<style>
	.wrapper {
		margin-bottom: 10vh !important;
	}
</style>

<style scoped lang="scss">
	@import "@styles/btn.scss";

	.user-data-form {
		@apply mb-16 pb-8;
		border-bottom: 1px solid hsla(0,0%,60%,0.3);

		.user-data-form-header {
			@apply my-8;
			@apply text-xl uppercase;
		}

		.field {
			@apply mb-4;
		}

		.btn {
			@apply mt-8;
		}
	}

	.days {
		@apply flex flex-wrap justify-center;

		> * {
			@apply flex-1 mx-2;
			flex-basis: calc(100% / 3 - 1rem);
		}
	}

	.related-data {
		@apply flex flex-row flex-wrap;

		> .user-data-form {
			@apply flex-1 mx-2;
			flex-basis: calc(50% - 1rem);

			@screen md {
				& {
					width: calc(50% - 1rem);
				}
			}
		}
	}
</style>

<script setup lang="ts">
import {
	ref,
	inject,
	computed,
	onMounted
} from "vue"

import { DayValues } from "$/types/database"
import type { FieldStatus } from "@/fields/types"
import type { PageContext } from "$/types/renderer"
import type { OptionInfo } from "$@/types/component"
import type { UserManagementInfo } from "$@/types/independent"
import type { DeserializedUserDocument } from "$/types/documents/user"
import type { DeserializedRoleListDocument } from "$/types/documents/role"
import type { DeserializedDepartmentListDocument } from "$/types/documents/department"
import type { DeserializedEmployeeScheduleResource } from "$/types/documents/employee_schedule"

import Fetcher from "$@/fetchers/user"
import RoleFetcher from "$@/fetchers/role"
import DepartmentFetcher from "$@/fetchers/department"
import makeManagementInfo from "@/user/make_management_info"
import convertForSentence from "$/string/convert_for_sentence"
import fillSuccessMessages from "$@/helpers/fill_success_messages"
import loadRemainingRoles from "@/helpers/loaders/load_remaining_roles"
import extractAllErrorDetails from "$@/helpers/extract_all_error_details"
import loadRemainingDepartments from "@/helpers/loaders/load_remaining_departments"

import Suspensible from "@/helpers/suspensible.vue"
import ListRedirector from "@/helpers/list_redirector.vue"
import NonSensitiveTextField from "@/fields/non-sensitive_text.vue"
import SelectableOptionsField from "@/fields/selectable_options.vue"
import SchedulePickerGroup from "@/settings/schedule_picker_group.vue"
import ReceivedErrors from "@/helpers/message_handlers/received_errors.vue"
import MultiSelectableOptionsField from "@/fields/multi-selectable_options.vue"
import ReceivedSuccessMessages from "@/helpers/message_handlers/received_success_messages.vue"

type RequiredExtraProps = "user" | "roles" | "departments"
const pageContext = inject("pageContext") as PageContext<"deserialized", RequiredExtraProps>
const { pageProps } = pageContext

const user = ref<DeserializedUserDocument<"roles"|"department">>(
	{
		...pageProps.user,
		"data": {
			...pageProps.user.data
		}
	} as DeserializedUserDocument<"roles"|"department">
)

const roles = ref<DeserializedRoleListDocument>(pageProps.roles as DeserializedRoleListDocument)
const userRoleIDs = ref(
	user.value.data.roles.data.map(role => role.id) as string[]
)
const selectableRoles = computed<OptionInfo[]>(() => roles.value.data.map(
	role => ({
		"label": role.name,
		"value": role.id
	})
))

const departments = ref<DeserializedDepartmentListDocument>(
	pageProps.departments as DeserializedDepartmentListDocument
)
const userDepartment = ref(user.value.data.department.data.id as string)
const selectableDepartments = computed(() => departments.value.data.map(
	department => ({
		"label": department.acronym,
		"value": department.id
	})
))

const { userProfile } = pageProps
const managementInfo = computed<UserManagementInfo>(
	() => makeManagementInfo(userProfile, user.value.data)
)

const isReachableEmployee = computed<boolean>(
	() => user.value.data.kind === "reachable_employee"
)

const isDeleted = computed<boolean>(() => managementInfo.value.isDeleted)
const mayUpdateUser = computed<boolean>(() => managementInfo.value.mayUpdateUser)

const mayArchiveUser = computed<boolean>(() => managementInfo.value.mayArchiveUser)
const mayRestoreUser = computed<boolean>(() => managementInfo.value.mayRestoreUser)

const mayUpdateAttachedRoles = computed<boolean>(() => managementInfo.value.mayUpdateAttachedRoles)
const mayResetPassword = computed<boolean>(() => managementInfo.value.mayResetPassword)

const textFieldStatus = ref<FieldStatus>(mayUpdateUser.value ? "enabled" : "disabled")
const emailVerified = computed<string>(() => {
	let verifyEmail = ""
	const verification = user.value.data.emailVerifiedAt
	if (verification) {
		verifyEmail = "E-mail: Verified ✓"
	} else {
		verifyEmail = "E-mail: Unverified ✘"
	}

	return String(verifyEmail)
})
const friendlyKind = computed<string>(() => convertForSentence(user.value.data.kind))
const isCurrentlyStudent = computed<boolean>(() => user.value.data.kind === "student")
const studentNumber = computed<string>(() => {
	if (isCurrentlyStudent.value) {
		const castNormalUser = user.value as DeserializedUserDocument
		const castUser = castNormalUser as DeserializedUserDocument<"studentDetail">

		return castUser.data.studentDetail.data.studentNumber
	}

	return ""
})
const hasSubmittedUser = ref<boolean>(true)

const schedules = (
	user.value.data.employeeSchedules?.data ?? []
) as DeserializedEmployeeScheduleResource[]

const fetcher = new Fetcher()
const receivedErrors = ref<string[]>([])
const successMessages = ref<string[]>([])
async function updateUser() {
	hasSubmittedUser.value = false
	await fetcher.update(user.value.data.id, {
		"deletedAt": null,
		"email": user.value.data.email,
		"emailVerifiedAt": user.value.data.emailVerifiedAt?.toJSON() ?? null,
		"kind": user.value.data.kind,
		"name": user.value.data.name,
		"prefersDark": user.value.data.prefersDark ? user.value.data.prefersDark : false
	})
	.then(() => {
		if (user.value.data.emailVerifiedAt) {
			const oldEmail = pageProps.user.data.email
			const newEmail = user.value.data.email

			if (oldEmail !== newEmail) {
				user.value = {
					...user.value,
					"data": {
						...user.value.data,
						"emailVerifiedAt": null
					}
				}
			}
		}

		fillSuccessMessages(
			receivedErrors,
			successMessages,
			"User Name updated successfully."
		)
	})
	.catch(response => extractAllErrorDetails(response, receivedErrors, successMessages))
	hasSubmittedUser.value = true
}

const hasSubmittedRole = ref<boolean>(true)
async function updateRoles() {
	hasSubmittedRole.value = false
	await fetcher.updateAttachedRole(user.value.data.id, userRoleIDs.value)
	.then(() => {
		fillSuccessMessages(
			receivedErrors,
			successMessages,
			"Role updated successfully.")
	})
	.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))

	hasSubmittedRole.value = true
}

const hasSubmittedDepartment = ref<boolean>(true)
async function updateDepartment() {
	hasSubmittedDepartment.value = false
	await fetcher.updateDepartment(user.value.data.id, userDepartment.value).then(() => {
		user.value.data.department.data.id = userDepartment.value
	})
	.then(() => {
		fillSuccessMessages(
			receivedErrors,
			successMessages,
			"Department updated successfully.")
	})
	.catch(responseWithErrors => extractAllErrorDetails(
		responseWithErrors,
		receivedErrors,
		successMessages)
	)

	hasSubmittedDepartment.value = true
}

const hasPerformedWholeChange = ref<boolean>(true)
async function resetUserPassword() {
	hasPerformedWholeChange.value = false
	await fetcher.resetPassword(user.value.data.id)
	.then(() => {
		const command = "Please check the inbox of the registered email for the password."
		const note = "Email may not be sent if the email is not verified."

		successMessages.value = [
			...successMessages.value,
			`${command} ${note}`
		]
	})
	.then(() => {
		fillSuccessMessages(
			receivedErrors,
			successMessages,
			"Reset password successfully.")
	})
	.catch(response => extractAllErrorDetails(response, receivedErrors, successMessages))
	hasPerformedWholeChange.value = true
}

async function archiveUser() {
	hasPerformedWholeChange.value = false
	await fetcher.archive([ user.value.data.id ])
	.then(() => {
		user.value = {
			...user.value,
			"data": {
				...user.value.data,
				"deletedAt": new Date()
			}
		}

		fillSuccessMessages(receivedErrors, successMessages)
	})
	.catch(response => extractAllErrorDetails(response, receivedErrors, successMessages))
	hasPerformedWholeChange.value = true
}

async function restoreUser() {
	hasPerformedWholeChange.value = false
	await fetcher.restore([ user.value.data.id ])
	.then(() => {
		user.value = {
			...user.value,
			"data": {
				...user.value.data,
				"deletedAt": null
			}
		}

		fillSuccessMessages(receivedErrors, successMessages)
	})
	.catch(response => extractAllErrorDetails(response, receivedErrors, successMessages))
	hasPerformedWholeChange.value = true
}

const roleFetcher = new RoleFetcher()
const departmentFetcher = new DepartmentFetcher()

onMounted(async() => {
	await loadRemainingDepartments(departments, departmentFetcher)
	await loadRemainingRoles(roles, roleFetcher)
})
</script>
