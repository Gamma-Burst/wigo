import { login, signup } from './actions'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string, redirect_url?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md card-3d bg-white/5 dark:bg-[#141412] backdrop-blur-3xl border border-white/10 p-8 rounded-3xl relative z-10">
        
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/logo-banner.png"
              alt="WIGO"
              width={150}
              height={45}
              className="w-auto h-10 object-contain hover:scale-105 transition-transform"
              priority
            />
          </Link>
        </div>

        <h1 className="text-2xl font-black text-center mb-2">Bienvenue sur WIGO</h1>
        <p className="text-center text-sm text-foreground/60 mb-8">
          Découvrez la nouvelle façon de voyager avec l&apos;IA.
        </p>

        <form className="flex flex-col gap-4 text-sm w-full">
          {searchParams?.message && (
            <div className="p-4 bg-foreground/10 text-foreground border border-foreground/20 rounded-xl text-center mb-2 font-medium">
              {searchParams.message}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-foreground/80 pl-1" htmlFor="email">
              Email
            </label>
            <input
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
              name="email"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-2">
            <label className="font-bold text-foreground/80 pl-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <input type="hidden" name="redirect_url" value={searchParams.redirect_url || '/'} />

          <button
            formAction={login}
            className="w-full bg-foreground text-background font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg mt-2"
          >
            Se Connecter
          </button>
          
          <button
            formAction={signup}
            className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
            S&apos;inscrire
          </button>
        </form>

        <p className="text-center text-xs text-foreground/40 mt-8">
          En vous inscrivant, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.
        </p>
      </div>
    </div>
  )
}
