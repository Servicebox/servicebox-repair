// components/Main/Main.js
'use client';

import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import MainBanner from "../MainBanner/MainBanner";
import Service from "../Service/Service";
import AboutRef from "../AboutRef/AboutRef";
import Contacts from "../Contacts/Contacts";
import ArronService from "../ArronnService/ArronnService";
import AboutMe from "../AboutMe/AboutMe";
import Gifts from "../Gifts/Gifts";
import WorkSteps from "../WorkSteps/WorkSteps";
import ReviewsSection from "../ReviewsSection/ReviewsSection"
import ServicePricePage from "../ServicePricePage/ServicePricePage"


function Main() {
  return (
    <div>
      <main className="main">
        <MainBanner />
        <ServicePricePage />
        <AboutRef />
        <ArronService />
        <AboutMe />
        <WorkSteps />
        <Gifts />
        <Contacts />
        <ReviewsSection />
      </main>
    </div>
  );
}

export default Main;