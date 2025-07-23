"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import TeamCard from "./TeamCard";
import { useI18n } from "@/lib/hooks/useI18n";

// Team data for carousel
const teams = [
  {
    name: "Inter",
    nickname: "Nerazzurri",
    logo: "https://media.api-sports.io/football/teams/505.png",
    href: "/shop/serieA?team=inter",
    colors: "from-blue-900 via-blue-800 to-black",
    bgGradient: "from-blue-900/20 to-black/20",
    borderColor: "border-blue-500",
    textColor: "text-blue-400",
  },
  {
    name: "Milan",
    nickname: "Rossoneri",
    logo: "https://media.api-sports.io/football/teams/489.png",
    href: "/shop/serieA?team=milan",
    colors: "from-red-600 via-red-700 to-red-800",
    bgGradient: "from-red-600/20 to-red-800/20",
    borderColor: "border-red-500",
    textColor: "text-red-400",
  },
  {
    name: "Juventus",
    nickname: "Bianconeri",
    logo: "https://media.api-sports.io/football/teams/496.png",
    href: "/shop/serieA?team=juventus",
    colors: "from-black via-gray-900 to-gray-800",
    bgGradient: "from-black/20 to-gray-800/20",
    borderColor: "border-gray-600",
    textColor: "text-gray-300",
  },
  {
    name: "Napoli",
    nickname: "Partenopei",
    logo: "https://media.api-sports.io/football/teams/492.png",
    href: "/shop/serieA?team=napoli",
    colors: "from-blue-500 via-blue-600 to-blue-700",
    bgGradient: "from-blue-500/20 to-blue-700/20",
    borderColor: "border-blue-400",
    textColor: "text-blue-300",
  },
  {
    name: "Roma",
    nickname: "Giallorossi",
    logo: "https://media.api-sports.io/football/teams/497.png",
    href: "/shop/serieA?team=roma",
    colors: "from-yellow-400 via-orange-500 to-red-600",
    bgGradient: "from-yellow-400/20 to-red-600/20",
    borderColor: "border-orange-500",
    textColor: "text-orange-400",
  },
  {
    name: "Lazio",
    nickname: "Biancocelesti",
    logo: "https://media.api-sports.io/football/teams/487.png",
    href: "/shop/serieA?team=lazio",
    colors: "from-blue-400 via-blue-500 to-blue-600",
    bgGradient: "from-blue-400/20 to-blue-600/20",
    borderColor: "border-blue-300",
    textColor: "text-blue-300",
  },
  {
    name: "Atalanta",
    nickname: "La Dea",
    logo: "https://media.api-sports.io/football/teams/499.png",
    href: "/shop/serieA?team=atalanta",
    colors: "from-blue-600 via-blue-700 to-blue-800",
    bgGradient: "from-blue-600/20 to-blue-800/20",
    borderColor: "border-blue-500",
    textColor: "text-blue-400",
  },
  {
    name: "Fiorentina",
    nickname: "Viola",
    logo: "https://media.api-sports.io/football/teams/502.png",
    href: "/shop/serieA?team=fiorentina",
    colors: "from-purple-600 via-purple-700 to-purple-800",
    bgGradient: "from-purple-600/20 to-purple-800/20",
    borderColor: "border-purple-500",
    textColor: "text-purple-400",
  },
];

export default function TeamCarousel() {
  const { t } = useI18n();

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#0e1924] mb-6 sm:mb-8 md:mb-10">
          {t('home.favoriteTeams')}
        </h2>
        <div className="relative">
          <Carousel
            className="py-4 sm:py-6 md:py-8 px-8"
            opts={{
              align: "start",
              slidesToScroll: 2,
            }}
          >
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
            <CarouselContent>
              {teams.map((team) => (
                <CarouselItem key={team.name} className="basis-1/4">
                  <TeamCard team={team} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
