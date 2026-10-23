export default defineNuxtPlugin(async () => {
  const supabase = useSupabase()
  const { user, ready } = useAuthUser()

  if (!supabase) {
    ready.value = true
    return
  }

  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user ?? null
  ready.value = true

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })
})
