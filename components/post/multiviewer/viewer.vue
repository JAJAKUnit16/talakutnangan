<template>
	<article>
		<UpdatePostForm
			v-model="post"
			:is-shown="mustUpdate"
			@close="closeUpdateForm"/>
		<Overlay :is-shown="mustArchiveOrRestore" @close="closeArchiveOrRestore">
			<template #header>
				<h1>Enter the post details</h1>
			</template>
			<template #default>
				<ReceivedErrors v-if="receivedErrors.length" :received-errors="receivedErrors"/>
				<ReceivedSuccessMessages
					v-if="successMessages.length"
					:received-success-messages="successMessages"/>
				<p v-if="mustArchive">
					Do you really want to archive?
				</p>
				<p v-if="mustRestore">
					Do you really want to restore?
				</p>
			</template>
			<template #footer>
				<button
					class="btn btn-back"
					type="button"
					@click="closeArchiveOrRestore">
					Back
				</button>
				<button
					v-if="mustArchive"
					class="btn submit-btn btn-primary"
					type="button"
					@click="archivePost">
					Archive post
				</button>
				<button
					v-if="mustRestore"
					class="btn submit-btn btn-primary"
					type="button"
					@click="restorePost">
					Restore post
				</button>
			</template>
		</Overlay>
		<header class="post-header">
			<div class="post-details">
				<div class="poster">
					<ProfilePicture
						class="profile-picture"
						:user="post.poster"/>
					<div class="poster-details">
						<span>
							<span>
								{{ post.poster.data.name }}
							</span>
							<small>
								as {{ post.posterRole.data.name }}
							</small>
						</span>
						<span class="department-and-timestamp">
							<small>
								<span>
									{{ postDepartment }}
								</span>
								<span class="timestamp" :title="completeFriendlyPostTimestamp">
									{{
										` ${friendlyPostTimestamp}`
									}}
								</span>
							</small>
						</span>
					</div>
				</div>
				<Menu
					v-if="mayHaveMenu"
					:post="post"
					@update-post="openUpdateForm"
					@archive-post="confirmArchive"
					@restore-post="confirmRestore"/>
			</div>
			<div v-if="hasExistingTags" class="attached-tags">
				<div
					v-for="tag in tags"
					:key="tag.id"
					class="tag selected">
					<span>
						{{ tag.name }}
					</span>
				</div>
			</div>
		</header>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<p class="post-content" v-html="formattedContent"></p>
		<div v-if="hasExistingAttachments">
			<div
				v-for="attachment in postAttachments"
				:key="attachment.id"
				:title="`${attachment.type} ${attachment.id}`"
				class="preview-file">
				<div v-if="isImage(attachment.fileType)" class="preview-img-container">
					<div class="removable-image relative">
						<img class="preview-img" :src="attachment.fileContents"/>
					</div>
					<small class="preview-title">
						Attachment {{ attachment.id }}
					</small>
				</div>
				<div
					v-else
					class="preview-file-container">
					<span class="material-icons mr-2">
						attachment
					</span>
					<small class="preview-file-title">
						Attachment {{ attachment.id }}
					</small>
				</div>
			</div>
		</div>
		<footer class="post-footer">
			<a :href="readPostPath" class="comment-count">
				<span class="material-icons icon">
					comment
				</span>
				<span>
					{{ friendlyCommentCount }}
				</span>
			</a>
		</footer>
	</article>
</template>

<style lang="scss">
	@screen sm {
		.overlay .content {
			margin: 5% 0 !important;
			max-height: 100vh !important;
		}
	}

	.post-content {
		h1 { @apply text-5xl; }

		h2 { @apply text-4xl; }

		h3 { @apply text-3xl; }

		h4 { @apply text-2xl; }

		h5 { @apply text-xl; }

		h6 { @apply text-xl; }

		strong { @apply font-bold; }

		em { @apply italic; }

		blockquote {
			@apply bg-light-100 dark:bg-opacity-20
			pl-2 border-l-8 border-blue-800;
			}

		ol {
			li {
				@apply list-item;
			}
		}
		ul {
			li {
				@apply ml-6;
			}
		}
		code{ @apply text-sm; }

		hr{ @apply border-b border-b-dark-500 dark:border-b-light-500; }

		a{ @apply text-blue-800; }

		table, th, td {
				@apply border border-dark-500 dark:border-light-500;
			}

		pre {
			@apply dark:bg-gray-800 bg-gray-800  text-light-500;
		}

		del { @apply line-through; }

		ul {
			li[class="task-list-item"] {
				@apply ml-12;
			}
		}

		p {
			mark[class="=="] { @apply bg-yellow-300; }
		}
	}
</style>

<style scoped lang="scss">
	@import "@styles/btn.scss";
	@import "@styles/variables.scss";

	.post-content {
		@apply hyphens-auto;

		word-break: normal;
	}

	.tag {
		@apply inline-flex items-center text-sm;

		margin: 5px;
		border-radius: 25px;
		padding: 0 15px;

		height: 30px;

		color: white;
		background-color: $color-primary;

		&.unselected {
			@apply cursor-pointer hover:bg-gray-300;
		}
	}

	.preview-file-container {
		@apply mt-4 px-3 py-2;
		@apply bg-true-gray-200 flex items-center;

		.preview-file-title{
			@apply flex-1 text-xs;
		}
	}

	article {
		@apply flex flex-col flex-nowrap justify-between;
		@apply p-4 bg-gray-400 bg-opacity-20 shadow-md;
		@apply dark:bg-opacity-10;

		.post-header {
			@apply flex flex-col justify-between;
			.post-details {
				@apply mb-4;
				@apply flex-1 flex flex-row justify-between;

				.poster {
					@apply flex flex-row items-start;
					.profile-picture {
						@apply mr-2 flex-initial w-auto h-12;
					}

					.poster-details {
						@apply flex flex-col;

						.department-and-timestamp {
							small {
								@apply flex flex-col sm:flex-row;

								.timestamp {
									@apply sm:ml-2;
								}
							}
						}
					}
				}
			}

			.attached-tags {
				@apply mb-4;
			}
		}

		.comment-count {
			@apply flex-initial flex flex-row flex-nowrap justify-start items-center;
		}

		> p {
			word-break: normal;
			word-wrap: normal;
		}


		.post-footer {
			@apply mt-8;
		}
	}

	.icon { @apply mr-2; }
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

import type { DeserializedPostResource } from "$/types/documents/post"
import type { DeserializedTagResource, DeserializedTagListDocument } from "$/types/documents/tag"
import type {
	DeserializedPostAttachmentResource,
	DeserializedPostAttachmentListDocument
} from "$/types/documents/post_attachment"

import { READ_POST } from "$/constants/template_page_paths"

import Fetcher from "$@/fetchers/post"
import pluralize from "$/string/pluralize"
import makeSwitch from "$@/helpers/make_switch"
import assignPath from "$@/external/assign_path"
import isUndefined from "$/type_guards/is_undefined"
import specializePath from "$/helpers/specialize_path"
import fillSuccessMessages from "$@/helpers/fill_success_messages"
import convertMarkdownToHTML from "$/string/convert_markdown_to_html"
import extractAllErrorDetails from "$@/helpers/extract_all_error_details"
import formatToFriendlyPastTime from "$@/helpers/format_to_friendly_past_time"
import formatToCompleteFriendlyTime from "$@/helpers/format_to_complete_friendly_time"

import Overlay from "@/helpers/overlay.vue"
import Menu from "@/post/multiviewer/viewer/menu.vue"
import ProfilePicture from "@/consultation/list/profile_picture_item.vue"
import ReceivedErrors from "@/helpers/message_handlers/received_errors.vue"
import UpdatePostForm from "@/post/multiviewer/viewer/update_post_form.vue"
import ReceivedSuccessMessages from "@/helpers/message_handlers/received_success_messages.vue"

const fetcher = new Fetcher()

function isImage(type: string): boolean {
	return type.includes("image")
}

type AssociatedPostResource = "poster"|"posterRole"|"department"|"postAttachments"|"tags"

const props = defineProps<{
	commentCount: number,
	modelValue: DeserializedPostResource<AssociatedPostResource>,
	mayHaveMenu: boolean
}>()

interface CustomEvents {
	(
		event: "update:modelValue",
		post: DeserializedPostResource<AssociatedPostResource>
	): void
	(event: "archive", post: DeserializedPostResource<AssociatedPostResource>): void
	(event: "restore", post: DeserializedPostResource<AssociatedPostResource>): void
}
const emit = defineEmits<CustomEvents>()

const isLoaded = ref<boolean>(false)
const post = ref<DeserializedPostResource<AssociatedPostResource>>(props.modelValue)
const formattedContent = computed<string>(() => {
	if (isLoaded.value) return convertMarkdownToHTML(post.value.content)
	return ""
})

const hasExistingAttachments = computed<boolean>(() => {
	const hasAttachments = !isUndefined(post.value.postAttachments)
	return hasAttachments
})
const postAttachments = computed<DeserializedPostAttachmentResource[]>(() => {
	if (hasExistingAttachments.value) {
		const attachments = post.value
		.postAttachments as DeserializedPostAttachmentListDocument

		return attachments.data
	}

	return []
})

const hasExistingTags = computed<boolean>(() => {
	const hasTags = !isUndefined(post.value.tags)
	return hasTags
})
const tags = computed<DeserializedTagResource[]>(() => {
	if (hasExistingTags.value) {
		const tagList = post.value.tags as DeserializedTagListDocument

		return tagList.data
	}

	return []
})

const {
	"state": mustUpdate,
	"on": openUpdateForm,
	"off": closeUpdateForm
} = makeSwitch(false)

const {
	"state": mustArchive,
	"on": confirmArchive,
	"off": closeArchive
} = makeSwitch(false)

const {
	"state": mustRestore,
	"on": confirmRestore,
	"off": closeRestore
} = makeSwitch(false)

const receivedErrors = ref<string[]>([])
const successMessages = ref<string[]>([])
const mustArchiveOrRestore = computed<boolean>(() => mustArchive.value || mustRestore.value)

function closeArchiveOrRestore() {
	receivedErrors.value = []
	successMessages.value = []
	closeArchive()
	closeRestore()
}

const postDepartment = computed<string>(() => {
	const { department } = post.value

	if (isUndefined(department)) {
		return "Posted to all"
	}

	return `Posted on ${department.data.fullName} (${department.data.acronym})`
})

const friendlyPostTimestamp = computed<string>(() => {
	const { createdAt } = post.value

	return formatToFriendlyPastTime(createdAt)
})

const completeFriendlyPostTimestamp = computed<string>(() => {
	const { createdAt, updatedAt } = post.value
	const friendlyCreationTime = formatToCompleteFriendlyTime(createdAt)
	const friendlyModificationTime = formatToCompleteFriendlyTime(updatedAt)

	return `Created at: ${friendlyCreationTime}\nUpdated at: ${friendlyModificationTime}`
})

const friendlyCommentCount = computed<string>(() => pluralize("comment", props.commentCount))

const readPostPath = computed<string>(() => {
	const postID = post.value.id

	const path = specializePath(READ_POST, {
		"id": postID
	})

	return path
})

function closeDialog() {
	emit("archive", post.value)
	emit("restore", post.value)
}

const TIMEOUT = 3000
async function archivePost(): Promise<void> {
	await fetcher.archive([ post.value.id ])
	.then(() => {
		fillSuccessMessages(receivedErrors, successMessages)
		setTimeout(closeDialog, TIMEOUT)
		assignPath("/forum")
	})
	.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))
}

async function restorePost(): Promise<void> {
	await fetcher.restore([ post.value.id ])
	.then(() => {
		fillSuccessMessages(receivedErrors, successMessages)
		setTimeout(closeDialog, TIMEOUT)
		assignPath("/forum")
	})
	.catch(responseWithErrors => extractAllErrorDetails(responseWithErrors, receivedErrors))
}

onMounted(() => {
	isLoaded.value = true
})
</script>
