<template>
	<div class="multiviewer">
		<form class="filters">
			<h3>Filters</h3>
			<div class="overflowing-container">
				<div class="filter-field-container">
					<SelectableOptionsField
						v-model="chosenDepartment"
						label="Department"
						class="filter department"
						:options="departmentNames"/>
					<DateRangePicker
						v-model:range-begin="rangeBegin"
						v-model:range-end="rangeEnd"
						:semesters="semesters"
						class="filter date-picker"/>
					<SelectableExistence v-model="existence" class="filter existence"/>
					<SearchableChip
						v-model="tags"
						header="Tags"
						:maximum-tags="MAX_TAGS"
						text-field-label="Type the tags to search"
						class="filter tags"/>
				</div>
			</div>
		</form>

		<Viewer
			v-for="(post, i) in posts.data"
			:key="post.id"
			v-model="posts.data[i]"
			:may-have-menu="true"
			:comment-count="posts.data[i].meta?.commentCount || 0"
			class="viewer"
			@archive="archivePost"
			@restore="restorePost"/>
		<Suspensible class="viewer-group" :is-loaded="isLoaded">
			<p v-if="hasNoPosts">
				There are no posts found.
			</p>

			<div v-if="hasRemainingPosts" class="load-others">
				<button
					class="btn btn-primary"
					@click="retrievePosts">
					Load other posts
				</button>
			</div>
		</Suspensible>
	</div>
</template>

<style lang="scss">
	.filter.department select {
		margin: 0 !important;
	}

</style>

<style scoped lang="scss">
@import "@styles/btn.scss";
@import "@styles/variables.scss";
	.multiviewer {
		@apply flex flex-col;

		.overflowing-container {
			@apply border border-gray-400 rounded-md;

			max-height: 150px;
			overflow-y: scroll;

			.filter-field-container {
				@apply p-2;
				@apply flex flex-col justify-between flex-wrap items-stretch;
				@apply bg-gray-300 bg-opacity-20;

				@screen md {
					@apply flex-row;
				}

				.filter{
					@apply mb-4;

					@screen md {
						@apply mb-0;
					}

					&.department {
						@apply flex-col;
					}
				}

				.existence {
					@apply flex flex-col flex-nowrap;
				}
			}
		}

		.viewer {
			@apply flex-1 my-4;
		}

		.viewer-group {
			@apply flex-1 flex flex-col;
		}
		.load-others {
			@apply flex-1;
			button { @apply w-[100%]; }
		}
	}
</style>

<script setup lang="ts">
import { ref, computed, watch, Ref, onMounted } from "vue"

import type { Existence } from "$/types/query"
import type { OptionInfo } from "$@/types/component"
import type {
	DeserializedPostListDocument,
	DeserializedPostResource
} from "$/types/documents/post"
import type { DeserializedTagResource } from "$/types/documents/tag"
import type { DeserializedDepartmentListDocument } from "$/types/documents/department"
import type {
	DeserializedSemesterListDocument
} from "$/types/documents/semester"

import { DEFAULT_LIST_LIMIT, MAX_TAGS } from "$/constants/numerical"
import { DEBOUNCED_WAIT_DURATION } from "$@/constants/time"

import Fetcher from "$@/fetchers/post"
import debounce from "$@/helpers/debounce"
import isUndefined from "$/type_guards/is_undefined"
import resetToMidnight from "$/time/reset_to_midnight"
import adjustUntilChosenDay from "$/time/adjust_until_chosen_day"
import loadRemainingResource from "$@/helpers/load_remaining_resource"
import adjustBeforeMidnightOfNextDay from "$/time/adjust_before_midnight_of_next_day"

import Viewer from "@/post/multiviewer/viewer.vue"
import Suspensible from "@/helpers/suspensible.vue"
import SearchableChip from "@/post/searchable_chip.vue"
import SelectableOptionsField from "@/fields/selectable_options.vue"
import DateRangePicker from "@/helpers/filters/date_range_picker.vue"
import SelectableExistence from "@/fields/selectable_radio/existence.vue"

type AssociatedPostResource = "poster"|"posterRole"|"department"|"postAttachments"|"tags"

const props = defineProps<{
	departments: DeserializedDepartmentListDocument,
	modelValue: DeserializedPostListDocument<AssociatedPostResource>,
	semesters: DeserializedSemesterListDocument,
	currentDepartment: string
}>()

interface CustomEvents {
	(
		event: "update:modelValue",
		post: DeserializedPostListDocument<AssociatedPostResource>
	): void
	(
		event: "update:currentDepartment",
		departmentID: string
	): void
}
const emit = defineEmits<CustomEvents>()

const currentDate = new Date()
const rangeBegin = ref<Date>(resetToMidnight(adjustUntilChosenDay(currentDate, 0, -1)))
const rangeEnd = ref<Date>(adjustBeforeMidnightOfNextDay(adjustUntilChosenDay(currentDate, 6, 1)))

// eslint-disable-next-line no-use-before-define
const debouncedCommentCounting = debounce(countCommentsOfPosts, DEBOUNCED_WAIT_DURATION)

const posts = computed<DeserializedPostListDocument<AssociatedPostResource>>({
	get(): DeserializedPostListDocument<AssociatedPostResource> {
		return props.modelValue
	},
	set(newValue: DeserializedPostListDocument<AssociatedPostResource>): void {
		if (newValue.data.some(post => isUndefined(post.meta))) {
			debouncedCommentCounting()
		}

		emit("update:modelValue", newValue)
	}
})
const hasNoPosts = computed<boolean>(() => posts.value.data.length === 0)
const hasRemainingPosts = computed<boolean>(
	() => posts.value.data.length < (posts.value.meta?.count || 0)
)

const tags = ref<DeserializedTagResource[]>([])

const NULL_AS_STRING = "~"
const departmentNames = computed<OptionInfo[]>(() => [
	{
		"label": "General",
		"value": NULL_AS_STRING
	},
	...props.departments.data.map(data => ({
		"label": data.acronym,
		"value": data.id
	}))
])
const chosenDepartment = computed<string>({
	get(): string {
		return props.currentDepartment
	},
	set(newDepartment: string): void {
		emit("update:currentDepartment", newDepartment)
	}
})
const existence = ref<string>("exists")
const isLoaded = ref(true)

function extractPostIDsWithNoVoteInfo(
	currentPosts: DeserializedPostListDocument<AssociatedPostResource>
): string[] {
	const commentsWithNoVoteInfo = currentPosts.data.filter(comment => isUndefined(comment.meta))
	const commentIDs = commentsWithNoVoteInfo.map(comment => comment.id)
	return commentIDs
}

const fetcher = new Fetcher()
async function countCommentsOfPosts(): Promise<void> {
	const postIDs = extractPostIDsWithNoVoteInfo(posts.value)

	if (postIDs.length === 0) return

	await fetcher.countComments(postIDs)
	.then(response => {
		const deserializedData = response.body.data
		const postsWithVoteInfo = [ ...posts.value.data ]

		for (const identifierData of deserializedData) {
			const { meta, id } = identifierData

			const postWithVoteInfo = postsWithVoteInfo.find(post => post.id === id)

			if (isUndefined(postWithVoteInfo)) {
				throw new Error("Posh requested to load comment info is missing.")
			} else {
				postWithVoteInfo.meta = meta
			}
		}

		posts.value = {
			...posts.value,
			"data": postsWithVoteInfo
		}
	})
}

async function retrievePosts() {
	isLoaded.value = false
	await loadRemainingResource(posts as Ref<DeserializedPostListDocument>, fetcher, () => ({
		"filter": {
			"dateTimeRange": {
				"begin": rangeBegin.value,
				"end": rangeEnd.value
			},
			"departmentID": chosenDepartment.value === NULL_AS_STRING ? null : chosenDepartment.value,
			"existence": existence.value as Existence,
			"tagIDs": tags.value.length === 0 ? "*" : tags.value.map(selectedTag => selectedTag.id)
		},
		"page": {
			"limit": DEFAULT_LIST_LIMIT,
			"offset": posts.value.data.length
		},
		"sort": [ "-createdAt" ]
	}), {
		"mayContinue": () => Promise.resolve(false)
	})
	isLoaded.value = true
}

function resetPostList() {
	posts.value = {
		"data": [],
		"meta": {
			"count": 0
		}
	}
	retrievePosts()
}

function removePost(
	postToRemove: DeserializedPostResource<AssociatedPostResource>, increment: number) {
	posts.value = {
		...posts.value,
		"data": posts.value.data.filter(post => post.id !== postToRemove.id),
		"meta": {
			...posts.value.meta,
			"count": Math.max((posts.value.meta?.count ?? 0) + increment, 0)
		}
	}
}

function archivePost(postToRemove: DeserializedPostResource<AssociatedPostResource>) {
	removePost(postToRemove, -1)
}

function restorePost(postToRemove: DeserializedPostResource<AssociatedPostResource>) {
	removePost(postToRemove, -1)
}

onMounted(async() => {
	await countCommentsOfPosts()

	watch(
		[
			chosenDepartment,
			existence,
			rangeBegin,
			rangeEnd,
			tags
		],
		debounce(resetPostList, DEBOUNCED_WAIT_DURATION)
	)

	isLoaded.value = true
})
</script>
