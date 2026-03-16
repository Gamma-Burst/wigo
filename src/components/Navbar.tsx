import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/logo-banner.png"
                                alt="WIGO"
                                width={160}
                                height={44}
                                className="h-11 w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Nav links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-6 text-foreground/80">
                            <Link href="/" className="flex items-center hover:text-accent transition-colors text-sm font-medium">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Explorer
                            </Link>
                            <Link href="/historique" className="flex items-center hover:text-accent transition-colors text-sm font-medium">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Historique
                            </Link>
                            <Link href="/pricing" className="flex items-center hover:text-accent transition-colors text-sm font-medium">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Pro
                            </Link>
                            <SignedOut>
                                <div className="flex items-center gap-1 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all">
                                    <SignInButton mode="modal" fallbackRedirectUrl="/historique" />
                                </div>
                            </SignedOut>
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </div>
                    </div>

                    {/* Mobile logo + menu */}
                    <div className="md:hidden flex items-center gap-3">
                        <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
                        <button className="text-foreground hover:text-accent p-2 focus:outline-none transition-colors">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
