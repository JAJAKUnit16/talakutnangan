<template>
	<div class="picture-picker">
		<slot></slot>

		<form>
			<input
				type="hidden"
				name="data[type]"
				:value="resourceType"/>
			<input
				:id="inputId"
				type="file"
				name="data[attributes][fileContents]"
				:accept="filesToAccept"
				class="input-pic"
				@change="submitImage"/>
		</form>
	</div>
</template>

<style scoped>
.input-pic {
	display: none;
}
</style>

<script setup lang="ts">
import { computed } from "vue"

import convertForParameter from "$/string/convert_for_parameter"

const props = defineProps<{
	resourceType: string
}>()
// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
	(event: "submitFile", data: FormData): void
}>()

const inputId = `input-${convertForParameter(props.resourceType)}`

const filesToAccept = computed<string>(() => "image/*")

function submitImage(event: Event) {
	const target = event.target as HTMLInputElement
	const form = target.form as HTMLFormElement
	const formData = new FormData(form)

	emit("submitFile", formData)
}
</script>
