<template>
	<section v-if="mustDisplayOnly" class="flex flex-col flex-nowrap">
		<header class="flex-1 flex flex-row flex-nowrap">
			<ProfilePicture
				class="flex-initial w-auto h-12"
				:user="comment.user"/>
			<h3 class="flex-1 m-auto ml-2">
				{{ comment.user.data.name }}
			</h3>
			<Menu
				class="flex-none m-auto mx-1 h-12 w-12"
				:comment="comment"
				@update-comment="openUpdateField"
				@archive-comment="confirmArchive"
				@restore-comment="confirmRestore"/>
			<Overlay :is-shown="mustArchiveOrRestore" @close="closeArchiveOrRestore">
				<template #header>
					<h1>Enter the comment details</h1>
				</template>
				<template #default>
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
						Archive comment
					</button>
					<button
						v-if="mustRestore"
						class="btn submit-btn btn-primary"
						type="button"
						@click="restorePost">
						Restore comment
					</button>
				</template>
			</Overlay>
		</header>
		<p class="flex-1 indent mt-4">
			{{ comment.content }}
		</p>
		<div class="comment-container">
			<div class="right">
				<h2 class="title">
					<!-- TODO: Put the total number of upvotes here -->
				</h2>
				<label class="switch">
					<!-- TODO: Put a checkbox to upvote -->
					<span class="slider"></span>
				</label>
				<h2 class="title">
					<!-- TODO: Put the total number of downvotes here -->
				</h2>
				<label class="switch">
					<!-- TODO: Put a checkbox to downvote -->
					<span class="slider"></span>
				</label>

				<h2 class="title">
					<!-- TODO: Put the total number of votes here -->
				</h2>
			</div>
		</div>
	</section>
</template>

<style lang="scss">
	@import "@styles/btn.scss";
</style>

<script setup lang="ts">
import { ref, computed } from "vue"

import type { DeserializedCommentResource } from "$/types/documents/comment"

import Fetcher from "$@/fetchers/comment"
import makeSwitch from "$@/helpers/make_switch"

import Overlay from "@/helpers/overlay.vue"
import Menu from "@/comment/multiviewer/viewer/menu.vue"
import ProfilePicture from "@/consultation/list/profile_picture_item.vue"

const fetcher = new Fetcher()

const props = defineProps<{
	modelValue: DeserializedCommentResource<"user"|"parentComment">
}>()

interface CustomEvents {
	(event: "update:modelValue", comment: DeserializedCommentResource<"user"|"parentComment">): void
	(event: "archive", comment: DeserializedCommentResource<"user"|"parentComment">): void
	(event: "restore", comment: DeserializedCommentResource<"user"|"parentComment">): void
}
const emit = defineEmits<CustomEvents>()

const comment = ref<DeserializedCommentResource<"user"|"parentComment">>(props.modelValue)

const {
	"state": mustUpdate,
	"on": openUpdateField
} = makeSwitch(false)
const mustDisplayOnly = computed(() => !mustUpdate.value)

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

const mustArchiveOrRestore = computed<boolean>(() => mustArchive.value || mustRestore.value)

function closeArchiveOrRestore() {
	closeArchive()
	closeRestore()
}

async function submitChangesSeparately(): Promise<void> {
	await fetcher.update(comment.value.id, {
		"content": comment.value.content,
		"deletedAt": null
	}).then(() => {
		emit("update:modelValue", comment.value)
	})
}

async function archivePost(): Promise<void> {
	await fetcher.archive([ comment.value.id ]).then(() => {
		emit("archive", comment.value)
	})
}

async function restorePost(): Promise<void> {
	await fetcher.restore([ comment.value.id ]).then(() => {
		emit("restore", comment.value)
	})
}
</script>