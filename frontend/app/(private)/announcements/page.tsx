"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import { ListFilter } from "lucide-react";

export default function Announcements() {
  const { isSidebarOpen, sidebarWidth } = useSidebar();
  const [active, setActive] = useState("Unread");

  return (
    <ProtectedRoute>
      <div
        className={`transition-all duration-300 ease-in-out bg-[#ffffff] overflow-hidden w-${sidebarWidth} min-h-[calc(100vh - 64px)}`}
        style={{
          marginLeft: isSidebarOpen ? sidebarWidth : "0",
          width: isSidebarOpen ? `calc(100% - ${sidebarWidth})` : "100%",
        }}
      >
        <div className="pt-[96px] mx-40 mb-6 p-6">
          <h1 className="text-4xl mb-4">Announcements</h1>

          {/* FILTERRRRRRRRRRRR */}
          <div className="flex gap-2">
            <button
              className={`w-20 px-1 py-1 rounded-2xl text-center transition-all shadow-sm ${
                active === "All"
                  ? "bg-[#a3a3a3] text-[#ffffff]"
                  : "bg-[#D9D9D9] text-[#4f4f4f] hover:bg-[#a3a3a3] hover:text-[#ffffff]"
              }`}
              onClick={() => setActive("All")}
            >
              All
            </button>
            <button
              className={`w-20 px-1 py-1 rounded-2xl text-center transition-all shadow-sm ${
                active === "Unread"
                  ? "bg-[#a3a3a3] text-[#ffffff]"
                  : "bg-[#D9D9D9] text-[#4f4f4f] hover:bg-[#a3a3a3] hover:text-[#ffffff]"
              }`}
              onClick={() => setActive("Unread")}
            >
              Unread
            </button>
            <button
              className={`w-20  px-1 py-1 rounded-2xl text-center hover:transition-all shadow-sm ${
                active === "Read"
                  ? "bg-[#a3a3a3] text-[#ffffff]"
                  : "bg-[#D9D9D9] text-[#4f4f4f] hover:bg-[#a3a3a3] hover:text-[#ffffff]"
              }`}
              onClick={() => setActive("Read")}
            >
              Read
            </button>
            <button
              className={`flex w-20  px-1 py-1 rounded-2xl text-center hover:transition-all shadow-sm ${
                active === "Filter"
                  ? "bg-[#a3a3a3] text-[#ffffff]"
                  : "bg-[#D9D9D9] text-[#4f4f4f] hover:bg-[#a3a3a3] hover:text-[#ffffff] "
              }`}
              onClick={() => setActive("Filter")}
            >
              <ListFilter className="pl-1 ml-[3px]" />
              Filter
            </button>
          </div>

          {/* Announcement content */}
          <div className="mt-10">
            <div className="ml-2">
              <p className="text-xl text-[#000000]">Angelika Ann B. Tamayo</p>
              <p className="text-[#474747]">Admin</p>
            </div>
            <div className="bg-[#D9D9D9] max-w-20% h-auto mx-auto p-3 rounded-xl shadow-custom mt-2">
              <div className="mx-12 text-[#2D2D2D] space-y-2">
                <p className="text-xl font-medium">Lorem Ipsum</p>
                <p className="text-justify">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmoadawdaasxdawdawdd tempor incididunt ut labore et
                  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo
                  consequat. Duis aute irure dolor in reprehenderit in
                  voluptaawdawdawwdawdawdawdte velit esse cillum dolore eu
                  fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                  proident, sunt in culpa qui officia deserunt mollit anim id
                  est laborum.
                </p>
              </div>
            </div>
            <p className="text-[#474747] text-sm text-right mr-3 mt-2">
              Today at 4:44 PM
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
