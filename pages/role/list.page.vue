<template>
	<ResourceManager
		v-model:chosen-sort="chosenSort"
		v-model:chosen-department="chosenDepartment"
		v-model:slug="slug"
		v-model:existence="existence"
		:is-loaded="isLoaded"
		:department-names="departmentNames"
		:sort-names="sortNames">
		<template #header>
			<TabbedPageHeader title="Role management" :tab-infos="resourceTabInfos">
				<template #additional-controls>
					<a
						v-if="mayCreateRole"
						href="/role/create"
						class="add-role-btn btn btn-primary">
						Add Role
					</a>
				</template>
			</TabbedPageHeader>
		</template>
		<template #resources>
			<ReceivedErrors v-if="receivedErrors.length" :received-errors="receivedErrors"/>
			<ResourceList
				v-if="mayEditRole"
				v-model:selectedIDs="selectedIDs"
				:template-path="READ_ROLE"
				:headers="headers"
				:list="tableData"
				@archive="archive"
				@restore="restore"
				@batch-archive="batchArchive"
				@batch-restore="batchRestore"/>
			<PageCounter
				v-model="offset"
				:max-resource-count="resourceCount"
				class="centered-page-counter"/>
		</template>
	</ResourceManager>
</template>

<style scoped lang="scss">
	@import "@styles/btn.scss";

	.centered-page-counter {
		@apply mt-4;
		@apply flex justify-center;
	}
</style>

<script setup lang="ts">
import { inject, onMounted, ref, computed, watch } from "vue"

import type { Existence } from "$/types/query"
import type { PageContext } from "$/types/renderer"
import type { ResourceCount } from "$/types/documents/base"
import type { TableData, OptionInfo } from "$@/types/component"
import type { DeserializedRoleListDocument } from "$/types/documents/role"
import type { DeserializedDepartmentListDocument } from "$/types/documents/department"

import { DEFAULT_LIST_LIMIT } from "$/constants/numerical"
import { READ_ROLE } from "$/constants/template_page_paths"
import { DEBOUNCED_WAIT_DURATION } from "$@/constants/time"

import { role as permissionGroup } from "$/permissions/permission_list"
import {
	UPDATE, ARCHIVE_AND_RESTORE, CREATE
} from "$/permissions/role_combinations"

import Fetcher from "$@/fetchers/role"
import debounce from "$@/helpers/debounce"
import pluralize from "$/string/pluralize"
import DepartmentFetcher from "$@/fetchers/department"
import makeManagementInfo from "@/role/make_management_info"
import loadRemainingResource from "$@/helpers/load_remaining_resource"
import resourceTabInfos from "@/resource_management/resource_tab_infos"
import loadRemainingDepartments from "@/helpers/loaders/load_remaining_departments"
import makeExistenceOperators from "@/resource_management/helpers/make_existence_operators"

import PageCounter from "@/helpers/page_counter.vue"
import TabbedPageHeader from "@/helpers/tabbed_page_header.vue"
import ResourceManager from "@/resource_management/resource_manager.vue"
import extractAllErrorDetails from "$@/helpers/extract_all_error_details"
import ReceivedErrors from "@/helpers/message_handlers/received_errors.vue"
import refetchList from "@/resource_management/helpers/refetch_resource_list"
import ResourceList from "@/resource_management/resource_manager/resource_list.vue"

type RequiredExtraProps =
	| "userProfile"
	| "roles"
	| "departments"
const pageContext = inject("pageContext") as PageContext<"deserialized", RequiredExtraProps>
const { pageProps } = pageContext

const fetcher = new Fetcher()
const departmentFetcher = new DepartmentFetcher()
const isLoaded = ref<boolean>(true)

const selectedIDs = ref<string[]>([])

const { userProfile } = pageProps

const headers = [ "Name", "No. of users" ]
const list = ref<DeserializedRoleListDocument>(
	pageProps.roles as DeserializedRoleListDocument)

const tableData = computed<TableData[]>(() => {
	const data = list.value.data.map(resource => {
		const managementInfo = makeManagementInfo(userProfile, resource)
		return {
			"data": [
				resource.name,
				pluralize("user", resource.meta ? resource.meta.userCount : 0)
			],
			"id": resource.id,
			"mayArchive": managementInfo.mayArchiveRole,
			"mayEdit": managementInfo.mayArchiveRole
				|| managementInfo.mayRestoreRole,
			"mayRestore": managementInfo.mayRestoreRole
		}
	})

	return data
})

const sortNames = computed<OptionInfo[]>(() => [
	{
		"label": "Ascending by name",
		"value": "name"
	},
	{
		"label": "Descending by name",
		"value": "-name"
	}
])
const chosenSort = ref("name")

const departments = ref<DeserializedDepartmentListDocument>(
	pageProps.departments as DeserializedDepartmentListDocument
)
const chosenDepartment = ref<string>("*")
const departmentNames = computed<OptionInfo[]>(() => [
	{
		"label": "All",
		"value": "*"
	},
	...departments.value.data.map(data => ({
		"label": data.acronym,
		"value": data.id
	}))
])

const slug = ref<string>("")
const existence = ref<Existence>("exists")

const offset = ref(0)
const resourceCount = computed<number>(() => {
	const castedResourceListMeta = list.value.meta as ResourceCount
	return castedResourceListMeta.count
})

const receivedErrors = ref<string[]>([])
async function countUsersPerRole(IDsToCount: string[]) {
	await fetcher.countUsers(IDsToCount).then(response => {
		const deserializedData = response.body.data
		const originalData = [ ...list.value.data ]

		for (const identifierData of deserializedData) {
			const { id, meta } = identifierData

			const index = originalData.findIndex(data => data.id === id)
			originalData[index].meta = meta
		}

		list.value = {
			...list.value,
			"data": originalData,
			"meta": list.value.meta
		}
	})
}
async function fetchRoleInfos(): Promise<void> {
	isLoaded.value = false

	await loadRemainingResource(list, fetcher, () => ({
		"filter": {
			"department": chosenDepartment.value,
			"existence": existence.value,
			"slug": slug.value
		},
		"page": {
			"limit": DEFAULT_LIST_LIMIT,
			"offset": offset.value
		},
		"sort": [ chosenSort.value ]
	}), {
		mayContinue() { return Promise.resolve(false) },
		async postOperations(deserializedData) {
			const IDsToCount = deserializedData.data.map(data => data.id)
			return await countUsersPerRole(IDsToCount)
		}
	})
	.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))

	isLoaded.value = true
}

const mayCreateRole = computed<boolean>(() => {
	const role = userProfile.data.roles.data
	const isPermitted = permissionGroup.hasOneRoleAllowed(role, [
		CREATE,
		UPDATE,
		ARCHIVE_AND_RESTORE
	])

	return isPermitted
}
)
const mayEditRole = computed<boolean>(() => {
	const role = userProfile.data.roles.data
	const isPermitted = permissionGroup.hasOneRoleAllowed(role, [
		UPDATE,
		ARCHIVE_AND_RESTORE
	])

	return isPermitted
})

function refetchRoles() {
	refetchList(
		isLoaded,
		list,
		receivedErrors,
		selectedIDs,
		fetchRoleInfos
	)
}

const debouncedResetList = debounce(refetchRoles, DEBOUNCED_WAIT_DURATION)

function clearOffset() {
	offset.value = 0
	debouncedResetList()
}

watch([ offset ], debouncedResetList)

watch(
	[ chosenSort, chosenDepartment, slug, existence ],
	clearOffset
)

const {
	archive,
	batchArchive,
	batchRestore,
	restore
} = makeExistenceOperators(
	list,
	fetcher,
	{
		existence,
		offset
	},
	selectedIDs,
	{
		isLoaded,
		receivedErrors
	}
)

onMounted(async() => {
	await countUsersPerRole(list.value.data.map(item => item.id))
	await loadRemainingDepartments(departments, departmentFetcher)
	isLoaded.value = true
})
</script>
