<template>
	<ListRedirector resource-type="department"/>

	<ReceivedErrors v-if="receivedErrors.length" :received-errors="receivedErrors"/>
	<ReceivedSuccessMessages
		v-if="successMessages.length"
		:received-success-messages="successMessages"/>
	<form @submit.prevent="openConfirmation">
		<NonSensitiveTextField
			v-model="department.data.fullName"
			v-model:status="fieldStatus"
			class="full-name border-solid"
			label="Full name"
			type="text"/>
		<NonSensitiveTextField
			v-model="capitalAcronym"
			v-model:status="fieldStatus"
			class="acronym border-solid"
			label="Acronym"
			type="text"/>
		<Checkbox
			v-model="mayAdmitRaw"
			:value="MAY_ADMIT"
			class="may-admit"
			label="May admit students"
			:disabled="mayNotChangeAdmission"/>
		<Suspensible :is-loaded="hasSubmittedDepartment">
			<div class="controls">
				<button
					v-if="mayUpdateDepartment"
					type="submit"
					class="update-department-btn btn btn-primary"
					@click="openConfirmation">
					update department
				</button>
				<button
					v-if="mayRestoreDepartment"
					type="button"
					class="btn btn-primary"
					@click="restoreDepartment">
					Restore
				</button>
				<button
					v-if="mayArchiveDepartment"
					type="button"
					class="btn btn-primary"
					@click="archiveDepartment">
					Archive
				</button>
			</div>
		</Suspensible>


		<ConfirmationPassword
			v-model="password"
			:must-confirm="isBeingConfirmed"
			@cancel="closeConfirmation"
			@confirm="updateDepartment"/>
	</form>
</template>

<style scoped lang="scss">
	@import "@styles/btn.scss";

	.controls{
		@apply flex justify-between;
	}
</style>

<script setup lang="ts">
import { ref, inject, computed } from "vue"

import type { FieldStatus } from "@/fields/types"
import type { PageContext } from "$/types/renderer"
import type { DepartmentManagementInfo } from "$@/types/independent"
import type { DeserializedDepartmentDocument } from "$/types/documents/department"

import Fetcher from "$@/fetchers/department"
import makeSwitch from "$@/helpers/make_switch"
import makeManagementInfo from "@/department/make_management_info"
import RequestEnvironment from "$/singletons/request_environment"
import fillSuccessMessages from "$@/helpers/fill_success_messages"
import extractAllErrorDetails from "$@/helpers/extract_all_error_details"

import Checkbox from "@/fields/checkbox.vue"
import Suspensible from "@/helpers/suspensible.vue"
import ListRedirector from "@/helpers/list_redirector.vue"
import NonSensitiveTextField from "@/fields/non-sensitive_text.vue"
import ReceivedErrors from "@/helpers/message_handlers/received_errors.vue"
import ConfirmationPassword from "@/authentication/confirmation_password.vue"
import ReceivedSuccessMessages from "@/helpers/message_handlers/received_success_messages.vue"

const pageContext = inject("pageContext") as PageContext<"deserialized", "department">
const { pageProps } = pageContext
const { userProfile } = pageProps

const department = ref<DeserializedDepartmentDocument>(
	{
		...pageProps.department,
		"data": {
			...pageProps.department.data
		}
	} as DeserializedDepartmentDocument
)
const capitalAcronym = computed({
	"get": () => department.value.data.acronym,
	set(newValue: string): void {
		department.value.data.acronym = newValue.toUpperCase()
	}
})
const managementInfo = computed<DepartmentManagementInfo>(
	() => makeManagementInfo(userProfile, department.value.data)
)

const mayUpdateDepartment = computed<boolean>(() => managementInfo.value.mayUpdateDepartment)
const mayArchiveDepartment = computed<boolean>(() => managementInfo.value.mayArchiveDepartment
)
const mayRestoreDepartment = computed<boolean>(() => managementInfo.value.mayRestoreDepartment)

const fieldStatus = computed<FieldStatus>(() => {
	const status = mayUpdateDepartment.value ? "enabled" : "disabled"
	return status
})
const mayNotChangeAdmission = computed<boolean>(() => !mayUpdateDepartment.value)
const MAY_ADMIT = "1"
const mayAdmitRaw = computed<string[]>({
	get(): string[] { return department.value.data.mayAdmit ? [ MAY_ADMIT ] : [] },
	set(newValue: string[]) {
		department.value.data.mayAdmit = newValue.indexOf(MAY_ADMIT) > -1
	}
})
const password = ref<string>(
	RequestEnvironment.isNotOnProduction
		? "password"
		: ""
)

const fetcher = new Fetcher()

const {
	"state": isBeingConfirmed,
	"on": openConfirmation,
	"off": closeConfirmation
} = makeSwitch(false)

const hasSubmittedDepartment = ref<boolean>(true)

const receivedErrors = ref<string[]>([])
const successMessages = ref<string[]>([])
async function updateDepartment() {
	hasSubmittedDepartment.value = false
	await fetcher.update(department.value.data.id, {
		"acronym": department.value.data.acronym,
		"deletedAt": null,
		"fullName": department.value.data.fullName,
		"mayAdmit": department.value.data.mayAdmit
	}, {
		"extraUpdateDocumentProps": {
			"meta": {
				"password": password.value
			}
		}
	})
	.then(() => {
		closeConfirmation()
		password.value = ""

		fillSuccessMessages(receivedErrors, successMessages)
	})
	.catch(response => extractAllErrorDetails(response, receivedErrors, successMessages))
	hasSubmittedDepartment.value = true
}

async function archiveDepartment() {
	hasSubmittedDepartment.value = false

	await fetcher.archive([ department.value.data.id ])
	.then(() => {
		if (!department.value.data.deletedAt) department.value.data.deletedAt = new Date()

		fillSuccessMessages(receivedErrors, successMessages)
	})
	.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))

	hasSubmittedDepartment.value = true
}

async function restoreDepartment() {
	hasSubmittedDepartment.value = false

	await fetcher.restore([ department.value.data.id ])
	.then(() => {
		if (department.value.data.deletedAt) department.value.data.deletedAt = null

		fillSuccessMessages(receivedErrors, successMessages)
	})
	.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))

	hasSubmittedDepartment.value = true
}
</script>
