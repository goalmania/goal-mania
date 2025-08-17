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
import { useTeams } from "@/hooks/useTeams";
import { Skeleton } from "@/components/ui/skeleton";

export const TeamCarousel = ({ isInternational = false }: { isInternational?: boolean }) => {
  const { t } = useI18n();
  const { teams: rawTeams, isLoading, error } = useTeams({
    initialLimit: 50, // Get more teams since we're showing all teams
    initialIsInternational: isInternational,
    initialIsActive: true, // Only active teams
  });

  // Transform API teams to match TeamCard expected type and ensure href is present
  const teams = rawTeams
    .filter(team => team.href || team.slug) // Only include teams with href or slug
    .map(team => ({
      _id: team._id,
      name: team.name,
      nickname: team.nickname,
      logo: team.logo,
      href: team.href || (isInternational ? `/shop/international/${team.slug}` : `/shop/serieA/${team.slug}`), // Use href or generate from slug
      colors: team.colors,
      bgGradient: team.bgGradient,
      borderColor: team.borderColor,
      textColor: team.textColor,
    }));

  // Dynamic title based on team type
  const getTitle = () => {
    if (isInternational) {
      return t('home.internationalTeams');
    }
    return t('home.serieATeams');
  };

  if (error) {
    return (
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#0e1924] mb-6 sm:mb-8 md:mb-10">
            {getTitle()}
          </h2>
          <div className="text-center text-red-600">
            {t('common.error')}: {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#0e1924] mb-6 sm:mb-8 md:mb-10">
          {getTitle()}
        </h2>
        <div className="relative">
          {isLoading ? (
            <div className="flex space-x-4 overflow-hidden px-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-1/4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : teams.length > 0 ? (
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
                  <CarouselItem key={team._id} className="basis-1/4">
                    <TeamCard team={team} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
            </Carousel>
          ) : (
            <div className="text-center text-gray-600">
              {t('common.noData')}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
