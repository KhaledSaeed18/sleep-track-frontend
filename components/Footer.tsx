import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-base-200 shadow">
            <div className="container mx-auto px-4 py-6 footer sm:footer-horizontal text-base-content">
                <aside>
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c0 1.657-4.03 3-9 3s-9-1.343-9-3m9 0V12m0 9v-9" />
                    </svg>
                    <p>
                        Sleep Track
                        <br />
                        Sleep better, live better.
                    </p>
                </aside>
                <nav>
                    <h6 className="footer-title">
                        Join Us
                    </h6>
                    <Link href='/auth/signup' className="link link-hover">
                        Signup
                    </Link>
                    <Link href='/auth/login' className="link link-hover">
                        Login
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
