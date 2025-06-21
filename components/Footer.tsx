import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-base-200 shadow">
            <div className="container mx-auto px-4 py-6 footer sm:footer-horizontal text-base-content">
                <aside>
                    <Image
                        src="/sleep-track.png"
                        alt="Sleep Tracker Logo"
                        width={60}
                        height={60}
                        className="size-15"
                    />
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
