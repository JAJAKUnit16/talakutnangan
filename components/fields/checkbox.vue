<template>
	<div class="input-container">
		<input
			v-model="proxiedValue"
			class="checkbox"
			type="checkbox"
			:class="inputClasses"
			:value="value"
			:disabled="disabled"/>
		<label v-if="label" class="input-header">
			{{ label }}
		</label>
	</div>
</template>

<style scoped lang = "scss">
	.checkbox{
		@apply bg-transparent mr-2;
	}
</style>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
	label?: string
	modelValue: string[]
	value: string
	required?: boolean
	disabled?: boolean
	inputClasses?: string
}>()

const emit = defineEmits<{(e: "update:modelValue", newModelValue: string[]): void}>()

const proxiedValue = computed<string[]>({
	"get": () => props.modelValue,
	set(newValues: string[]) { emit("update:modelValue", newValues) }
})
</script>
