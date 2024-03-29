<template>
	<IconButton
		class="container"
		icon-name="more_vert"
		@icon-click="toggle">
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
			@apply fixed bg-black z-500 opacity-30 block;
			inset:0;

			content: " "
		}

		.dropdown-container {
			@apply w-max;
			@apply border border-gray-300;
			@apply bg-light-500 fixed h-full z-501 h-min;
			@apply dark:bg-dark-400;
			@apply flex flex-col flex-nowrap;

			top: 50%;
			left: 50%;

			transform: translateX(-50%);
		}
	}

	@screen md {
		.container {
			.overlay { @apply bg-transparent; }

			.dropdown-container {
				@apply py-1 px-2;
				@apply absolute dark:bg-dark-400 bg-gray-100 h-max w-max;

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

function toggle() {
	emit("update:modelValue", !props.modelValue)
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
