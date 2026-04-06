'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=' + encodeURIComponent(error.message))
  }

  const redirectUrl = formData.get('redirect_url') as string || '/'
  
  revalidatePath('/', 'layout')
  redirect(redirectUrl)
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  
  const name = formData.get('name') as string

  const origin = process.env.NEXT_PUBLIC_SITE_URL 
    ? process.env.NEXT_PUBLIC_SITE_URL 
    : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: name ? { name } : undefined,
    },
  })

  if (error) {
    redirect('/signup?message=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=' + encodeURIComponent("Vérifie tes emails pour confirmer ton compte."))
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/')
}
