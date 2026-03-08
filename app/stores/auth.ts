import { createAuthClient } from "better-auth/client";

export const useAuthStore = defineStore("authStore", () => {
  const loading = ref(false);

  const authClient = createAuthClient();

  const signIn = async () => {
    loading.value = true;
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
      errorCallbackURL: "/error",
    });
    loading.value = false;
  };

  return { loading, signIn };
});
