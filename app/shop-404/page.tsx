import Link from "next/link";

export default function Page() {
  return (
    <main className="grid min-h-full place-items-center bg-[#0a0a0a] px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-[#c8f000]">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
          Page temporarily not available!
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-white/50 sm:text-xl/8">
          Sorry, this page is on development!.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Go back home
          </Link>
          <Link href="/" className="text-sm font-semibold text-white">
            Contact support <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
