<template>
	<ListRedirector resource-type="user"/>

	<ReceivedErrors v-if="receivedErrors.length" :received-errors="receivedErrors"/>
	<ReceivedSuccessMessages
		v-if="successMessages.length"
		:received-success-messages="successMessages"/>

	<form @submit.prevent="importData">
		<div>
			<MultiSelectableOptionsField
				v-model="chosenRoleIDs"
				class="role"
				label="Add the roles to attach"
				:options="roleNames"/>
			<SelectableOptionsField
				v-model="chosenKind"
				class="kind"
				label="What kind of users to import?"
				:options="kindNames"/>
		</div>
		<div>
			<label class="btn" for="choose-file-btn">
				<input
					id="choose-file-btn"
					type="file"
					name="meta[importedCSV]"
					accept="text/csv"
					@change="updateSelectedName"/>
				CHOOSE FILE
			</label>
			<span v-if="hasSelected" class="selected-file">{{ CSVFilename }}</span>
		</div>
		<div>
			<input
				type="hidden"
				name="data[type]"
				value="user"/>
			<input
				type="hidden"
				name="data[attributes][kind]"
				:value="chosenKind"/>
			<input
				v-for="(roleID, i) in chosenRoleIDs"
				:key="roleID"
				type="hidden"
				:name="`data[relationships][roles][data][${i}][type]`"
				value="role"/>

			<input
				v-for="(roleID, i) in chosenRoleIDs"
				:key="roleID"
				type="hidden"
				:name="`data[relationships][roles][data][${i}][id]`"
				:value="roleID"/>

			<input
				id="import-btn"
				class="btn btn-primary"
				type="submit"
				value="Import"/>
		</div>
		<output v-if="createdUsers.length > 0">
			<OutputTable>
				<template #table-headers>
					<th v-if="isStudentResource(createdUsers[0])" class="">Student number</th>
					<th>Name</th>
					<th>E-mail</th>
					<th>Department</th>
				</template>
				<template #table-body>
					<tr
						v-for="user in createdUsers"
						:key="user.id">
						<td v-if="isStudentResource(user)">
							{{ user.studentDetail.data.studentNumber }}
						</td>
						<td>{{ user.name }}</td>
						<td>{{ user.email }}</td>
						<td>{{ user.department.data.acronym }}</td>
					</tr>
				</template>
			</OutputTable>
		</output>
	</form>
</template>

<style scoped lang="scss">
	@import "@styles/btn.scss";

	.tabs-header {
		@apply mb-8 border-b;
	}

	.selected-file {
		@apply ml-2;
		@apply text-gray-700;
	}

	.kind{
		@apply flex-col;
		margin-bottom: 3em;
	}

	#choose-file-btn {
		display:none;
		appearance: none;
	}
	#import-btn{
		margin-top:1em;
	}

	@media (min-width: 640px) {
		.kind{
			@apply flex flex-row;
		}
	}
</style>

<script setup lang="ts">
import { inject, ref, computed, onMounted } from "vue"

import { UserKindValues } from "$/types/database"
import type { OptionInfo } from "$@/types/component"
import type { PageContext, PageProps } from "$/types/renderer"
import type { DeserializedRoleListDocument } from "$/types/documents/role"
import type { DeserializedUserResource, DeserializedStudentResource } from "$/types/documents/user"

import Fetcher from "$@/fetchers/user"
import RoleFetcher from "$@/fetchers/role"
import convertForSentence from "$/string/convert_for_sentence"
import loadRemainingRoles from "@/helpers/loaders/load_remaining_roles"

import fillSuccessMessages from "$@/helpers/fill_success_messages"
import extractAllErrorDetails from "$@/helpers/extract_all_error_details"

import OutputTable from "@/helpers/overflowing_table.vue"
import ListRedirector from "@/helpers/list_redirector.vue"
import SelectableOptionsField from "@/fields/selectable_options.vue"
import ReceivedErrors from "@/helpers/message_handlers/received_errors.vue"
import MultiSelectableOptionsField from "@/fields/multi-selectable_options.vue"
import ReceivedSuccessMessages from "@/helpers/message_handlers/received_success_messages.vue"

const pageContext = inject("pageContext") as PageContext
const { pageProps } = pageContext

const { "roles": rawRoles } = pageProps as PageProps<"serialized", "roles">
const roles = ref<DeserializedRoleListDocument>(rawRoles as DeserializedRoleListDocument)
const roleNames = computed<OptionInfo[]>(() => roles.value.data.map(data => ({
	"label": data.name,
	"value": data.id
})))
const chosenRoleIDs = ref<string[]>([])

const kindNames = UserKindValues.map(kind => ({
	"label": convertForSentence(kind),
	"value": kind
}))
const chosenKind = ref<string>(kindNames[0].value)

const fetcher = new Fetcher()
const createdUsers = ref<DeserializedUserResource<"roles"|"department">[]>([])
const receivedErrors = ref<string[]>([])
const successMessages = ref<string[]>([])
function importData(event: Event) {
	const form = event.target as HTMLFormElement
	const formData = new FormData(form)

	fetcher.import(formData)
	.then(({ body }) => {
		const { data } = body
		createdUsers.value = data as DeserializedUserResource<"roles"|"department">[]

		fillSuccessMessages(
			receivedErrors,
			successMessages,
			"Users have been imported successfully!"
		)
	})
	.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))
}

const CSVFilename = ref<string>("")
const hasSelected = computed<boolean>(() => CSVFilename.value !== "")

function updateSelectedName(event: Event): void {
	const target = event.target as HTMLInputElement
	const file = target.files?.item(0)
	const rawFilename = file?.name as ""

	CSVFilename.value = rawFilename
}

function isStudentResource(resource: DeserializedUserResource)
: resource is DeserializedStudentResource {
	return resource.kind === "student"
}

const roleFetcher = new RoleFetcher()
onMounted(async() => {
	await loadRemainingRoles(roles, roleFetcher)
})
</script>
