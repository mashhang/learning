"use client";

import React, { useState } from "react";
// import Dashboard from "./main/page";
import Navbar from "./Navbar";
// import LandingPage from "./components/LandingPAGE/LandingPage";
// import Offer from "./components/LandingPAGE/offer";
// import CardDeal from "./components/LandingPAGE/cardDeal";
// import GetStarted from "./components/LandingPAGE/GetStarted";
import {
  LandingPage,
  Offer,
  CardDeal,
  GetStarted,
} from "./components/LandingPAGE";

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const isAuthenticated = false;

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isProfileOpen={isProfileMenuOpen}
        toggleProfile={toggleProfile}
      />
      <div className="flex justify-center items-start">
        <div className="xl:max-w-[1280px] w-full  ">
          <LandingPage />
          <div className="mt-20 w-full h-[1px] bg-[#242830]"></div>
          <Offer />
          <div className="mt-[-25px] w-full h-[1px] bg-[#242830]"></div>
          <CardDeal />
          <GetStarted />
        </div>
      </div>

      {/* <Dashboard isSidebarOpen={isSidebarOpen} /> */}
    </>
  );
};

export default Page;
