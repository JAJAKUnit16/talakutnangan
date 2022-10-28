<template>
	<IconButton
		class="container"
		icon-name="more_vert"
		@icon-click="open">
		<template #associated-pop-outs>
			<div
				v-if="modelValue"
				class="overlay"
				@click="close"></div>
			<div v-if="modelValue" class="dropdown-container">
				<slot name="dropdown-contents"></slot>
			</div>
		</template>
	</IconButton>
</template>

<style scoped lang="scss">
	@import "@styles/variables.scss";

	.container {
		@apply flex-col relative;

		.overlay {
			@apply dark:bg-white fixed bg-black z-500 opacity-30 block;
			inset:0;

			content: " "
		}

		.dropdown-container {
			@apply w-max;
			@apply dark:bg-dark-400 fixed bg-white h-full z-501 h-min;
			@apply flex flex-col flex-nowrap;

			top: 50%;
			left: 50%;

			transform: translateX(-50%);
		}
	}

	@screen md {
		.container {
			.overlay { display: none }

			.dropdown-container {
				@apply absolute dark:bg-dark-400 bg-gray-100 h-max w-max py-1 px-2;

				inset: unset;
				transform: translatex(-50%) translateY(60%);
			}
		}
	}
</style>

<script setup lang="ts">
import isUndefined from "$/type_guards/is_undefined"
import { onUpdated } from "vue"

import IconButton from "@/helpers/icon_button.vue"

interface CustomEvents {
	(event: "update:modelValue", isShown: boolean): void
}
const emit = defineEmits<CustomEvents>()
const props = defineProps<{
	modelValue: boolean
}>()

function open() {
	emit("update:modelValue", true)
}

function close() {
	emit("update:modelValue", false)
}

onUpdated(() => {
	if (!isUndefined(window)) {
		window.onresize = () => {
			if (props.modelValue) close()
		}
	}
})
</script>
