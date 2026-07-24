// components/Main/Main.js
'use client';

import MainBanner from "../MainBanner/MainBanner";
import RepairCalculator from '@/components/RepairCalculator/RepairCalculator';
import CategoriesGrid from "../CategoriesGrid/CategoriesGrid";
import CommonProblems from "../CommonProblems/CommonProblems";
import ReviewsSection from "../ReviewsSection/ReviewsSection";
import WorkSteps from "../WorkSteps/WorkSteps";
import AboutMe from "../AboutMe/AboutMe";
import NewsBlock from "../NewsBlock/NewsBlock";
import Gifts from "../Gifts/Gifts";
import Contacts from "../Contacts/Contacts";

function Main() {
  return (
    <div>
      <section className="main">
        <MainBanner />
        <div id="repair-calculator" className="scroll-mt-24">
          <RepairCalculator />
        </div>
        <CategoriesGrid />
        <CommonProblems />
        <ReviewsSection />
        <WorkSteps />
        <AboutMe />
        <NewsBlock limit={4} />

        <Gifts />
        <Contacts />
      </section>
    </div>
  );
}

export default Main;