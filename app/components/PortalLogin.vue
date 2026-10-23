<script setup lang="ts">
const supabase = useSupabase()!
const email = ref('')
const sending = ref(false)
const sent = ref(false)
const error = ref('')

const redirectTo = () => `${window.location.origin}/portal`

async function signInDiscord() {
  error.value = ''
  const { error: err } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo: redirectTo(), scopes: 'identify email' },
  })
  if (err) error.value = err.message
}

async function signInEmail() {
  error.value = ''
  sending.value = true
  const { error: err } = await supabase.auth.signInWithOtp({
    email: email.value.trim(),
    options: { emailRedirectTo: redirectTo() },
  })
  sending.value = false
  if (err) error.value = err.message
  else sent.value = true
}
</script>

<template>
  <div class="card mx-auto max-w-md p-8">
    <h2 class="font-display text-2xl font-bold text-white">Sign in</h2>
    <p class="mt-2 text-sm text-fg-muted">
      Use the Discord account you joined the U-mai server with. That's how we'll reach you.
    </p>

    <button class="btn mt-6 w-full bg-[#5865F2] text-white hover:brightness-110" @click="signInDiscord">
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.3 18.3 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18a19.9 19.9 0 0 0 6 3l1.3-2a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2a19.8 19.8 0 0 0 6-3c.5-5.1-.8-9.6-3.6-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" /></svg>
      Continue with Discord
    </button>

    <div class="my-6 flex items-center gap-3 text-xs text-fg-muted">
      <span class="h-px flex-1 bg-ink-600" /> or use email <span class="h-px flex-1 bg-ink-600" />
    </div>

    <p v-if="sent" class="rounded-xl bg-peri/10 p-4 text-sm text-peri-light">
      Check <strong>{{ email }}</strong> for a sign-in link. Open it in this same browser.
    </p>
    <form v-else class="space-y-3" @submit.prevent="signInEmail">
      <label for="login-email" class="label">Email</label>
      <input id="login-email" v-model="email" type="email" required autocomplete="email" class="input" placeholder="you@student.university.edu.my">
      <button type="submit" class="btn-ghost w-full" :disabled="sending">
        {{ sending ? 'Sending…' : 'Email me a sign-in link' }}
      </button>
    </form>

    <p v-if="error" class="mt-4 text-sm text-rose-light" role="alert">{{ error }}</p>
  </div>
</template>
