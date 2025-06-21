'use client'

import { FaArrowLeft, FaHome, FaInfoCircle } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function NotFound() {
    const router = useRouter()
    return (
        <section>
            <div className="container flex items-center min-h-screen px-6 py-12 mx-auto">
                <div className="flex flex-col items-center max-w-sm mx-auto text-center">
                    <p className="p-4 rounded-full bg-primary">
                        <FaInfoCircle />
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold  md:text-3xl">Page not found</h1>
                    <p className="mt-4">The page you are looking for doesn't exist.</p>
                    <div className="flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto">
                        <button
                            className="btn btn-neutral"
                            onClick={() => router.back()}
                        >
                            <FaArrowLeft />
                            <span>Go back</span>
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={() => router.push('/')}
                        >
                            <FaHome />
                            Take me home
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}