"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";

const field = "h-14 w-full rounded-2xl bg-[var(--wall-2)] px-4 text-[17px] text-white placeholder:text-[var(--text-3)] shadow-[inset_0_0_0_1px_var(--line)] focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--lime)]";

function SignInContent() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const showAuthRequired = searchParams.get("reason") === "auth-required";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const result = await signIn("credentials", { email: formData.get("email") as string, password: formData.get("password") as string, redirect: false });
      if (result?.error) {
        setError("Email o password non corrette.");
        toast.error("Email o password non corrette.");
      } else {
        toast.success("Accesso effettuato");
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Qualcosa è andato storto. Riprova.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-[1760px] gap-10 px-5 py-10 md:px-10 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-16">
      <div className="hero-pitch relative overflow-hidden rounded-[28px] bg-[var(--wall)] p-8 shadow-[inset_0_0_0_1px_var(--line)] md:p-12">
        <Image src="/images/recentUpdate/goalmania-wordmark.png" alt="Goal Mania" width={1906} height={977} className="relative z-10 h-auto w-[min(80%,380px)]" priority />
        <ul className="relative z-10 mt-8 space-y-3 text-[18px] font-semibold text-white">
          {["Segui i tuoi ordini", "Salva le maglie che ti piacciono", "Al prossimo acquisto i tuoi dati sono già pronti"].map((t) => (
            <li key={t} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--lime)]" />{t}</li>
          ))}
        </ul>
      </div>

      <div className="mx-auto w-full max-w-[480px]">
        <h1 className="disp text-[clamp(2.6rem,6vw,4.4rem)] text-white">Accedi</h1>
        <p className="mt-2 text-[18px] italic text-[var(--text-2)]">Entra nel tuo account per vedere gli ordini.</p>
        {showAuthRequired && <p className="mt-4 rounded-2xl bg-[var(--wall-2)] px-4 py-3 text-[16px] font-semibold text-white" role="status">Per vedere questa pagina devi accedere.</p>}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <input name="email" type="email" inputMode="email" autoComplete="email" required placeholder="Email" aria-label="Email" className={field} />
          <input name="password" type="password" autoComplete="current-password" required placeholder="Password" aria-label="Password" className={field} />
          <div className="text-right"><Link href="/contact" className="text-[15px] font-semibold text-[var(--lime)] underline-offset-4 hover:underline">Password dimenticata? Scrivici</Link></div>
          {error && <p role="alert" className="text-[16px] font-semibold text-[var(--red)]">{error}</p>}
          <button type="submit" disabled={isLoading} className="btn btn-lime w-full disabled:opacity-60">{isLoading ? "Accesso…" : <>Accedi <ArrowRight className="h-5 w-5" strokeWidth={3} /></>}</button>
        </form>
        <div className="my-6 flex items-center gap-4 text-[14px] font-semibold text-[var(--text-3)]"><span className="h-px flex-1 bg-[var(--line)]" />oppure<span className="h-px flex-1 bg-[var(--line)]" /></div>
        <button type="button" onClick={() => signIn("google", { callbackUrl: "/" })} className="btn btn-glass w-full">Continua con Google</button>
        <p className="mt-6 text-center text-[16px] text-[var(--text-2)]">Non hai un account? <Link href="/auth/signup" className="font-bold text-[var(--lime)]">Registrati</Link></p>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
