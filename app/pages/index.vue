<script lang="ts" setup>
const authStore = useAuthStore()
</script>

<template>
    <div class="hero bg-base-300 container mx-auto mt-4">
        <div class="hero-content min-h-96 text-center">
            <div class="max-w-md">
                <h1 class="text-5xl font-bold">Possum Path</h1>
                <p class="py-6">
                    Keep track of your travels and adventures with this simple travel log app. Add locations, photos,
                    and notes to create a digital journal of your journeys.
                </p>
                <AuthButton v-if="!authStore.user" />
                <NuxtLink v-else to="/dashboard" class="btn btn-primary">
                    Start Logging
                </NuxtLink>
            </div>
        </div>
    </div>
</template>