"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
    email: z.string().email("Indirizzo email non valido"),

    phonePrefix: z.string().min(1, "Seleziona un prefisso"),
    phone: z
      .string()
      .min(7, "Il numero di telefono deve contenere almeno 7 cifre")
      .max(15, "Il numero di telefono deve contenere al massimo 15 cifre")
      .regex(/^[0-9]+$/, "Il numero di telefono deve contenere solo numeri"),

    country: z.string().min(1, "Il paese è obbligatorio"),

    marketing: z.boolean().optional(),

    password: z
      .string()
      .min(8, "La password deve contenere almeno 8 caratteri")
      .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
      .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
      .regex(/[0-9]/, "La password deve contenere almeno un numero"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

// Phone prefixes for different countries
const phonePrefix = [
  { code: "+39", country: "Italia", flag: "🇮🇹" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "Regno Unito", flag: "🇬🇧" },
  { code: "+49", country: "Germania", flag: "🇩🇪" },
  { code: "+33", country: "Francia", flag: "🇫🇷" },
  { code: "+34", country: "Spagna", flag: "🇪🇸" },
  { code: "+351", country: "Portogallo", flag: "🇵🇹" },
  { code: "+31", country: "Paesi Bassi", flag: "🇳🇱" },
  { code: "+32", country: "Belgio", flag: "🇧🇪" },
  { code: "+41", country: "Svizzera", flag: "🇨🇭" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "Cina", flag: "🇨🇳" },
  { code: "+81", country: "Giappone", flag: "🇯🇵" },
  { code: "+82", country: "Corea del Sud", flag: "🇰🇷" },
  { code: "+971", country: "Emirati Arabi", flag: "🇦🇪" },
];

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof SignUpForm, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: SignUpForm = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phonePrefix: formData.get("phonePrefix") as string,
      phone: formData.get("phone") as string,
      country: formData.get("country") as string,
      marketing: formData.get("marketing") === "on",
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    try {
      // Validate form data
      signUpSchema.parse(data);

      // Combine phone prefix and number
      const fullPhone = `${data.phonePrefix}${data.phone}`;

      // Send registration request
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          phone: fullPhone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Qualcosa è andato storto");
      }

      // Sign in the user automatically
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Impossibile effettuare l'accesso");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof SignUpForm, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof SignUpForm] = err.message;
          }
        });
        setValidationErrors(errors);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Qualcosa è andato storto");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 p-6 lg:p-10 gap-10 lg:gap-0">
      {/* Image Left */}
      <div className="relative h-[60vh] lg:h-auto rounded-2xl">
        <div className="absolute inset-0">
          <img
            src={`/images/recentUpdate/login-bg.png`}
            alt="Banner Background"
            className="w-full h-full rounded-2xl object-cover"
          />
        </div>
      </div>

      {/* Form Right */}
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-start text-[47px] font-medium font-munish tracking-tight text-gray-900">
            Crea account
          </h2>
        </div>

        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4">
            <form className="space-y-6 font-munish" onSubmit={handleSubmit}>
              {/* Phone Number with Prefix Selector */}
              <div>
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Numero di telefono
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    id="phonePrefix"
                    name="phonePrefix"
                    className="bg-white border text-sm rounded-lg py-2.5 font-munish border-gray-300 text-[#333333] font-light px-3 shadow-none focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
                    defaultValue="+39"
                  >
                    {phonePrefix.map((prefix) => (
                      <option key={prefix.code} value={prefix.code}>
                        {prefix.flag} {prefix.code}
                      </option>
                    ))}
                  </select>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="bg-white border-0 flex-1 border-b py-2 border-black placeholder:text-[#333333] text-[#333333] font-light rounded-none shadow-none pl-0"
                    placeholder="xxxxxxxxxx"
                  />
                </div>
                {validationErrors.phone && (
                  <p className="mt-2 text-sm text-red-600">
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* Marketing Checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="marketing"
                  name="marketing"
                  className=" bg-[#D9D9D9] rounded-full"
                />
                <Label
                  htmlFor="marketing"
                  className="text-sm text-gray-600 select-none cursor-pointer"
                >
                  Avvisami su ordini, offerte e aggiornamenti
                </Label>
              </div>

              {/* Full Name */}
              <Input
                id="name"
                name="name"
                type="text"
                required
                className="bg-white border-0 w-full border-b py-2 border-black placeholder:text-[#333333] text-[#333333] font-light rounded-none shadow-none pl-0"
                placeholder="Nome completo"
              />
              {validationErrors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}

              {/* Email */}
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="bg-white border-0 w-full border-b py-2 border-black placeholder:text-[#333333] text-[#333333] font-light rounded-none shadow-none pl-0"
                placeholder="Indirizzo email"
              />
              {validationErrors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.email}
                </p>
              )}

              {/* Country Only */}
              <div>
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-gray-700"
                >
                  Paese
                </Label>
                <select
                  id="country"
                  name="country"
                  className="bg-white border text-sm rounded-lg py-2.5 mt-1 w-full font-munish border-gray-300 text-[#333333] font-light px-3 shadow-none focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
                  defaultValue="Italy"
                >
                  <option value="Italy">Italia</option>
                  <option value="USA">Stati Uniti</option>
                  <option value="UK">Regno Unito</option>
                  <option value="Germany">Germania</option>
                  <option value="France">Francia</option>
                  <option value="Spain">Spagna</option>
                  <option value="Portugal">Portogallo</option>
                  <option value="Netherlands">Paesi Bassi</option>
                  <option value="Belgium">Belgio</option>
                  <option value="Switzerland">Svizzera</option>
                  <option value="Austria">Austria</option>
                  <option value="Nigeria">Nigeria</option>
                </select>
                {validationErrors.country && (
                  <p className="mt-2 text-sm text-red-600">
                    {validationErrors.country}
                  </p>
                )}
              </div>

              {/* Password */}
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white border-0 w-full border-b py-2 border-black placeholder:text-[#333333] text-[#333333] font-light rounded-none shadow-none pl-0"
                placeholder="Crea una password"
              />
              {validationErrors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.password}
                </p>
              )}

              {/* Confirm Password */}
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="bg-white border-0 w-full border-b py-2 border-black placeholder:text-[#333333] text-[#333333] font-light rounded-none shadow-none pl-0"
                placeholder="Conferma la password"
              />
              {validationErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.confirmPassword}
                </p>
              )}

              {/* Error message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-100">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-1">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-full bg-[#FF7A00] px-3 gap-1.5 py-2 text-sm font-medium items-center text-[#0A1A2F] shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FF7A00]/90"
                >
                  {isLoading ? "Creazione account..." : "Crea account →"}
                </Button>

                <div className=" text-[#888888] text-[14px] text-center">
                  Leggi l'informativa sulla{" "}
                  <span className=" text-[#3182CE]">privacy </span>e i{" "}
                  <span className=" text-[#3182CE]">termini e condizioni</span>
                </div>
              </div>
            </form>
          </div>

          <p className=" font-munish text-center text-[14px] text-[#888888] mt-4">
            Hai già un account?{" "}
            <Link
              href="/auth/login"
              className="text-[#3182CE] hover:underline"
            >
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}