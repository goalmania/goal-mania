import SerieATeamsClient from "@/app/_components/SerieATeamsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Serie A Teams | Goal Mania",
  description: "Browse all Serie A team jerseys and merchandise",
};

export default function SerieATeamsPage() {
  return <SerieATeamsClient />;
}
