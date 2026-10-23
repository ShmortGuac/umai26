<script setup lang="ts">
const supabase = useSupabase()!
const { links } = useAppConfig()

const step = ref<'email' | 'code'>('email')
const email = ref('')
const code = ref('')
const busy = ref(false)
const error = ref('')
const notFound = ref(false)

async function sendCode() {
  error.value = ''
  notFound.value = false
  busy.value = true
  const address = email.value.trim().toLowerCase()

  const { data: allowed, error: checkErr } = await supabase.rpc('can_sign_in', { p_email: address })
  if (checkErr) {
    busy.value = false
    error.value = checkErr.message
    return
  }
  if (!allowed) {
    busy.value = false
    notFound.value = true
    return
  }

  const { error: err } = await supabase.auth.signInWithOtp({ email: address })
  busy.value = false
  if (err) error.value = err.message
  else {
    email.value = address
    step.value = 'code'
  }
}

async function verifyCode() {
  error.value = ''
  busy.value = true
  const { error: err } = await supabase.auth.verifyOtp({
    email: email.value,
    token: code.value.trim(),
    type: 'email',
  })
  busy.value = false
  // On success the auth listener updates the user and the portal swaps views.
  if (err) error.value = err.message.includes('expired') || err.message.includes('invalid')
    ? 'That code is wrong or has expired. Check the latest email, or send a new code.'
    : err.message
}

function startOver() {
  step.value = 'email'
  code.value = ''
  error.value = ''
}
</script>

<template>
  <div class="card mx-auto max-w-md p-8">
    <h2 class="font-display text-2xl font-bold text-white">Sign in</h2>

    <form v-if="step === 'email'" class="mt-6 space-y-4" @submit.prevent="sendCode">
      <p class="text-sm text-fg-muted">
        Use the <strong class="text-white">same email you registered with</strong> in the Google Form.
        We'll email you a sign-in code.
      </p>
      <div>
        <label for="login-email" class="label">Email</label>
        <input id="login-email" v-model="email" type="email" required autocomplete="email" class="input" placeholder="you@example.com">
      </div>
      <button type="submit" class="btn-primary w-full" :disabled="busy">
        {{ busy ? 'Checking…' : 'Send me a code' }}
      </button>

      <div v-if="notFound" class="rounded-xl bg-gold/10 p-4 text-sm text-gold" role="alert">
        <p class="font-semibold">We couldn't find that email on the approved players list.</p>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-gold/90">
          <li>Make sure it's the exact email you used in the registration form.</li>
          <li>Approval happens after we check your payment and student ID, so it may take a little while after registering.</li>
          <li>Still stuck? Ask us in the <a :href="links.discord" target="_blank" rel="noopener" class="underline underline-offset-4">Discord</a>.</li>
        </ul>
      </div>
    </form>

    <form v-else class="mt-6 space-y-4" @submit.prevent="verifyCode">
      <p class="text-sm text-fg-muted">
        We sent a code to <strong class="break-all text-white">{{ email }}</strong>. It may take a minute, and check your spam folder too.
      </p>
      <div>
        <label for="login-code" class="label">Sign-in code</label>
        <input
          id="login-code"
          v-model="code"
          inputmode="numeric"
          autocomplete="one-time-code"
          pattern="[0-9]{6,10}"
          maxlength="10"
          required
          class="input text-center font-display text-2xl tracking-[0.4em] tabular-nums"
          placeholder="••••••"
        >
      </div>
      <button type="submit" class="btn-primary w-full" :disabled="busy">
        {{ busy ? 'Signing in…' : 'Sign in' }}
      </button>
      <div class="flex justify-between text-sm">
        <button type="button" class="text-fg-muted hover:text-white" @click="startOver">← Use a different email</button>
        <button type="button" class="text-fg-muted hover:text-white" :disabled="busy" @click="sendCode">Resend code</button>
      </div>
    </form>

    <p v-if="error" class="mt-4 text-sm text-rose-light" role="alert">{{ error }}</p>
  </div>
</template>
