import Link from "next/link";
import Image from "next/image";

const navigation = {
  main: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "Terms", href: "/terms" },
    { name: "Privacy", href: "/privacy" },
    { name: "Shipping", href: "/shipping" },
  ],
  social: [
    {
      name: "Instagram",
      href: "https://www.instagram.com/goalmaniaofficial/",
      icon: (props: React.ComponentProps<"svg">) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: "https://x.com/goalmania_",
      icon: (props: React.ComponentProps<"svg">) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@goalmania_",
      icon: (props: React.ComponentProps<"svg">) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M9.37,23.5a7.468,7.468,0,0,1-7.5-7.5,7.407,7.407,0,0,1,5.483-7.14v3.746a3.763,3.763,0,1,0,4.017,6.344V6.621h3.253a6.3,6.3,0,0,0,.687,3.257h-.687a10.494,10.494,0,0,1-5.253,9.285V23.5Z" />
          <path d="M19.87,0.5H16.62V15.75a3.75,3.75,0,1,1-3.75-3.75h0V8.254a7.5,7.5,0,1,0,7.5,7.5V6.621h1a6.254,6.254,0,0,0,3.63-1.156V2.211A6.257,6.257,0,0,1,19.87.5Z" />
        </svg>
      ),
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gradient-to-t from-[#f5963c] to-[#0e1924] text-white pt-10 pb-4">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-6">
          {/* Placeholder logo - replace src with your actual logo file */}
          <div className="mb-2">
            <Image src="/favicon.ico" alt="GoalMania Logo" width={64} height={64} className="rounded-full shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold tracking-wide mb-2">Goal<span className="text-[#f5963c]">Mania</span></h2>
          <p className="text-center max-w-md text-sm text-white/80 mb-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu auctor leo, vitae dapibus sapien. Etiam vehicula lacus ac suscipit accumsan.
          </p>
          <button className="mt-2 px-4 py-2 bg-[#f5963c] text-[#0e1924] font-semibold rounded hover:bg-[#ffb366] transition">Read more</button>
        </div>
        {/* Navigation */}
        <nav className="grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:justify-center sm:space-x-12 mb-6" aria-label="Footer">
          {navigation.main.map((item) => (
            <div key={item.name} className="text-center sm:text-left">
              <Link href={item.href} className="text-xs sm:text-sm leading-6 text-white/80 hover:text-white">
                {item.name}
              </Link>
            </div>
          ))}
        </nav>
        {/* Social Icons */}
        <div className="flex justify-center space-x-8 sm:space-x-10 mb-6">
          {navigation.social.map((item) => (
            <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="text-center text-xs leading-5 text-white/60 border-t border-white/20 pt-4 w-full">
          &copy; {new Date().getFullYear()} Goal Mania. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs text-white/60">
          <Link href="/terms">Terms & Conditions</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/accessibility">Accessibility Information</Link>
          <Link href="/contact">Contact us</Link>
        </div>
      </div>
    </footer>
  );
}
