<template>
	<div class="main">
		<div class="forum-header">
			<h1>
				Welcome to the Forum
			</h1>
			<button
				v-if="mayPost"
				class="create-post btn btn-primary"
				@click="showCreateForm">
				add post
			</button>
		</div>
		<CreatePostForm
			:is-shown="isCreateShown"
			:departments="departments"
			@close="hideCreateForm"/>
		<Multiviewer
			v-model="posts"
			v-model:currentDepartment="currentDepartment"
			:departments="departments"
			:semesters="semesters"
			class="multiviewer"/>
	</div>
</template>

<style scoped lang="scss">
	@import "@styles/btn.scss";
	@import "@styles/variables.scss";
	.main {
		@apply flex flex-col flex-nowrap justify-center items-stretch;

		.forum-header {
			@apply p-2 bg-gray-400 bg-opacity-20;

			@apply flex justify-between items-center;

			h1 {
				@apply text-base font-semibold sm:text-xl;
			}
			.account-attachment {
				@apply h-6 w-auto;
			}
			.create-post {
				@apply w-auto;
			}

		}
		.file-media{
			@apply mr-2;
		}

		.multiviewer {
			@apply flex-1 mt-4;
		}
	}

</style>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from "vue"

import type { PageContext } from "$/types/renderer"
import type { DeserializedPostListDocument } from "$/types/documents/post"
import type { DeserializedSemesterListDocument } from "$/types/documents/semester"
import type {
	DeserializedDepartmentListDocument,
	DeserializedDepartmentResource
} from "$/types/documents/department"

import { DEFAULT_LIST_LIMIT } from "$/constants/numerical"

import makeSwitch from "$@/helpers/make_switch"
import SemesterFetcher from "$@/fetchers/semester"
import DepartmentFetcher from "$@/fetchers/department"
import loadRemainingResource from "$@/helpers/load_remaining_resource"
import loadRemainingDepartments from "@/helpers/loaders/load_remaining_departments"

import { READ as READ_SEMESTERS } from "$/permissions/semester_combinations"
import {
	post as permissionGroup,
	semester as semesterPermissionGroup
} from "$/permissions/permission_list"
import {
	READ_ANYONE_ON_ALL_DEPARTMENTS,
	CREATE_SOCIAL_POST_ON_OWN_DEPARTMENT,
	CREATE_PUBLIC_POST_ON_ANY_DEPARTMENT,
	CREATE_PERSONAL_POST_ON_OWN_DEPARTMENT
} from "$/permissions/post_combinations"

import Multiviewer from "@/post/multiviewer.vue"
import CreatePostForm from "@/post/create_post_form.vue"

type RequiredExtraProps = "posts"|"departments"|"semesters"
const pageContext = inject("pageContext") as PageContext<"deserialized", RequiredExtraProps>
const { pageProps } = pageContext
const { userProfile } = pageProps

type AssociatedPostResource = "poster"|"posterRole"|"department"|"postAttachments"|"tags"
const posts = ref<DeserializedPostListDocument<AssociatedPostResource>>(
	pageProps.posts as DeserializedPostListDocument<AssociatedPostResource>
)

const departments = ref<DeserializedDepartmentListDocument>(
	pageProps.departments as DeserializedDepartmentListDocument
)

const semesters = ref<DeserializedSemesterListDocument>(
	pageProps.semesters as DeserializedSemesterListDocument
)

const currentDepartment = ref<string>(userProfile.data.department.data.id)

const {
	"state": isCreateShown,
	"on": showCreateForm,
	"off": hideCreateForm
} = makeSwitch(false)

const departmentFetcher = new DepartmentFetcher()
onMounted(async() => {
	const mayViewAllDepartments = permissionGroup.hasOneRoleAllowed(
		userProfile.data.roles.data,
		[ READ_ANYONE_ON_ALL_DEPARTMENTS ]
	)

	if (mayViewAllDepartments) {
		await loadRemainingDepartments(departments, departmentFetcher)
	} else {
		departments.value = {
			...departments.value,
			"data": [
				...departments.value.data,
				userProfile.data.department.data as DeserializedDepartmentResource
			],
			"meta": {
				...departments.value.meta,
				"count": departments.value.meta?.count || 1
			}
		}
	}

	const mayViewSemesters = semesterPermissionGroup.hasOneRoleAllowed(userProfile.data.roles.data, [
		READ_SEMESTERS
	])

	if (mayViewSemesters) {
		await loadRemainingResource(semesters, new SemesterFetcher(), () => ({
			"filter": {
				"existence": "exists",
				"slug": ""
			},
			"page": {
				"limit": DEFAULT_LIST_LIMIT,
				"offset": semesters.value.data.length
			},
			"sort": [ "startAt" ]
		}))
	}
})

const mayPost = computed<boolean>(() => {
	const roles = userProfile.data.roles.data
	const department = userProfile.data.department.data
	const isInOwnDepartment = currentDepartment.value === department.id
	const isLimitedToOwnDepartment = permissionGroup.hasOneRoleAllowed(roles, [
		CREATE_PERSONAL_POST_ON_OWN_DEPARTMENT
	]) && isInOwnDepartment

	const isLimitedToSocialPost = permissionGroup.hasOneRoleAllowed(userProfile.data.roles.data, [
		CREATE_SOCIAL_POST_ON_OWN_DEPARTMENT
	]) && isInOwnDepartment

	const isLimitedToAnyDepartment = permissionGroup.hasOneRoleAllowed(roles, [
		CREATE_PUBLIC_POST_ON_ANY_DEPARTMENT
	])

	return isLimitedToOwnDepartment || isLimitedToSocialPost || isLimitedToAnyDepartment
})
</script>
