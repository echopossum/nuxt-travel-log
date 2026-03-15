<script lang="ts" setup>
import { InsertLocation } from "~/lib/db/schema";
import { toTypedSchema } from "@vee-validate/zod";
import type { FetchError } from "ofetch";

const router = useRouter();
const submitError = ref("");
const loading = ref(false);
const submitted = ref(false);

const { $csrfFetch } = useNuxtApp();

const { handleSubmit, errors, meta } = useForm({
    validationSchema: toTypedSchema(InsertLocation),
});

const onSubmit = handleSubmit(async (values) => {
    try {
        submitError.value = "";
        loading.value = true;
        await $csrfFetch("/api/locations", {
            method: "POST",
            body: values,
        });
        submitted.value = true;
        navigateTo("/dashboard");
    } catch (e) {
        const error = e as FetchError;
        submitError.value = error.statusMessage || "An unknown error occured";
    }
    loading.value = false;
});

onBeforeRouteLeave(() => {
    if (meta.value.dirty && !submitted.value) {
        const confirm = window.confirm(
            "Are you sure you want to leave? All unsaved changes will be lost.",
        );
        if (!confirm) {
            return false;
        }
    }
    return true;
});
</script>

<template>
    <div class="container max-w-md mx-auto">
        <div class="text-lg my-4">
            <h1>Add Location</h1>
            <p class="text-sm">
                A location is a place you have traveled or will travel to. It
                can be a city, country, state, or point of interest. You can add
                specific times you visited this location after adding it.
            </p>
        </div>
        <div v-if="submitError" role="alert" class="alert alert-error">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <span>{{ submitError }}</span>
        </div>
        <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
            <AppFormField
                name="name"
                type="text"
                label="Name"
                :error="errors.name"
                :disabled="loading"
            />
            <AppFormField
                name="description"
                type="textarea"
                label="Description"
                :error="errors.description"
                :disabled="loading"
            />
            <AppFormField
                name="lat"
                type="number"
                label="Latitude"
                :error="errors.lat"
                :disabled="loading"
            />
            <AppFormField
                name="long"
                type="number"
                label="Longitude"
                :error="errors.long"
                :disabled="loading"
            />
            <div class="flex justify-end gap-2">
                <button
                    :disabled="loading"
                    class="btn btn-outline"
                    type="button"
                    @click="router.back()"
                >
                    <Icon size="24" name="tabler:logout-2" />
                    Cancel
                </button>
                <button
                    :disabled="loading"
                    class="btn btn-primary"
                    type="submit"
                >
                    Add
                    <span
                        v-if="loading"
                        class="loading loading-spinner loading-sm"
                    />
                    <Icon v-else size="24" name="tabler:circle-plus-filled" />
                </button>
            </div>
        </form>
    </div>
</template>
