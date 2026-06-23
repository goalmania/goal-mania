import Image from "next/image";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi Siamo",
  description:
    "Goal Mania è il negozio online italiano di maglie da calcio a prezzi accessibili. Scopri la nostra storia, i nostri valori e perché più di 10.000 tifosi si affidano a noi.",
  alternates: {
    canonical: "https://goal-mania.it/about",
  },
};

const Page = () => {
  return (
    <div className="md:p-15 p-8 md:space-y-20 space-y-10 ">
      <div className=" flex flex-col md:flex-row justify-between items-center gap-5 md:gap-10">
        <div className=" md:w-1/2 w-full">
          <h2 className=" text-[#c8f000] font-bold md:text-[26px] text-lg md:text-left text-center">
            About Us
          </h2>
          <h1 className=" text-white font-extrabold md:text-[47px] text-[32px] font-inter md:leading-12 leading-8 md:text-left text-center">
            La tua dose quotidiana <br /> di calcio
          </h1>
          <p className=" text-white/60 font-munish font-bold md:text-[18px] text-sm md:text-left text-center">
            Il calcio raccontato con passione, ogni giorno.
          </p>
        </div>
        <div className=" md:w-1/2 w-full">
          <div className="relative w-full md:h-[400px] h-[300px]">
            <Image
              src="/images/aboutimages/aboutimg.jpg"
              alt="About Hero"
              fill
              className="rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
      <div className=" flex  flex-col md:flex-row-reverse justify-between items-center gap-10">
        <div className=" md:w-1/2 w-full">
          <h1 className=" text-white font-bold md:text-[47px] text-[35px] font-inter text-center md:text-left">
            Chi Siamo
          </h1>
          <p className=" text-[#292929] font-munish font-medium md:text-[18px] text-[16px] text-center md:text-left">
            Goalmania nasce dalla passione per il calcio, con l’obiettivo di
            raccontarlo ogni giorno in modo veloce, chiaro e coinvolgente. Dalle
            breaking news di mercato alle storie delle leggende, dagli
            approfondimenti tattici ai momenti indimenticabili: tutto ciò che un
            tifoso vuole sapere lo trova qui.
          </p>
        </div>
        <div className=" md:w-1/2 w-full">
          <div className="relative w-full h-[290px]">
            <Image
              src="/images/aboutimages/goalpost.jpg"
              alt="About Hero"
              fill
              className="rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
      <div className=" flex flex-col md:flex-row justify-between items-center gap-10">
        <div className=" md:w-1/2 w-full">
          <h1 className=" text-white font-bold md:text-[47px] text-[35px] text-center md:text-left font-inter">
            La Nostra Missione
          </h1>
          <p className=" text-[#292929] font-munish font-medium md:text-[18px] text-[16px] text-center md:text-left">
            Non siamo solo un sito di informazione: siamo una community in
            crescita, dove ogni contenuto è pensato per chi vive il calcio 24/7.
            Il nostro impegno è portarti il meglio del calcio, ovunque tu sia.
          </p>
        </div>
        <div className=" md:w-1/2 w-full">
          <div className="relative w-full h-[290px]">
            <Image
              src="/images/aboutimages/throphy.jpg"
              alt="About Hero"
              fill
              className="rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
      <div className=" text-center space-y-8">
        <div className="">
          <h2 className=" text-[#c8f000] font-medium md:text-[47px] text-[36px] font-munish">
            Ultime Notizie
          </h2>
          <p className="text-white font-munish font-normal md:text-[18px] text-[16px] md:w-1/2 w-full mx-auto">
            Rimani aggiornato con le novità più importanti dal mondo del calcio:
            trasferimenti, risultati, curiosità
          </p>
        </div>
        <div className=" flex flex-col gap-10">
          <div className=" flex md:flex-row flex-col gap-10 justify-between">
            <div className="bg-[#111111] md:w-1/2 w-full font-munish h-[156px] font-medium text-[18px] text-white flex justify-center items-center rounded-[30px]">
              Notizie in tempo reale su trasferimenti, partite e curiosità.
            </div>
            <div className="bg-[#111111] md:w-1/2 w-full font-munish h-[156px] font-medium text-[18px] text-white flex justify-center items-center rounded-[30px]">
              Approfondimenti su tattiche, storie e leggende del calcio.{" "}
            </div>
          </div>
          <div className="">
            <div className="bg-[#111111] w-full font-munish h-[156px] font-medium text-[18px] text-white flex justify-center items-center rounded-[30px]">
              <p className=" w-1/2 mx-auto ">
                Shop esclusivo con maglie da calcio attuali e retrò, fedeli agli
                originali, a un prezzo unico di 35€.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
