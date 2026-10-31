// Niente force-dynamic: questo layout è solo wrapper visivo (gradiente di
// sfondo), non fa fetch di dati. Senza il force-dynamic, Next.js può
// pre-renderizzare le 5 pagine squadra come statiche (serviti da CDN,
// zero query/compute per visita) invece di rieseguirle ad ogni richiesta.
export default function InternationalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,rgba(245,150,60,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}