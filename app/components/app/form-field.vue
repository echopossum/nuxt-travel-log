<script lang="ts" setup>
const props = defineProps<{
    label: string,
    name: string,
    type: "text" | "textarea" | "number",
    error?: string
}>()
</script>

<template>
    <fieldset class="fieldset">
        <legend class="fieldset-legend">{{ props.label }}</legend>
        <Field :name="props.name" :type="props.type" class="w-full"
            :class="{ 'input-error': props.error, 'input': type === 'text' || type === 'number', 'textarea': type === 'textarea' }" />
        <p v-if="props.error" class="fieldset-label text-error">{{ props.error }}</p>
    </fieldset>
</template>