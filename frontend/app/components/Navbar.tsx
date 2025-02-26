"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import logo from "../../public/logo.png";
import {
  LayoutDashboard,
  BookOpen,
  ChartNoAxesColumn,
  LibraryBig,
  Backpack,
  Bell,
  UserRound,
  Bolt,
  CircleHelp,
  LogOut,
} from "lucide-react";
import Image from "next/image";

type NavbarProps = {
  isAuthenticated: boolean;
  isSidebarOpen: boolean;
  isProfileOpen: boolean;
  toggleProfile: () => void;
  toggleSidebar: () => void;
};

const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  isSidebarOpen,
  isProfileOpen,
  toggleProfile,
  toggleSidebar,
}) => {
  const pathname = usePathname();
  const { logout } = useAuth();

  if (pathname === "/login") return null; // Hide on login
  if (pathname === "/register") return null; // Hide on login

  // State to store first lesson ID
  const [firstLessonId, setFirstLessonId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the first lesson
    fetch("http://localhost:5001/api/lessons")
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setFirstLessonId(data[0].id); // ✅ Set first lesson ID
        }
      })
      .catch((error) => console.error("Error fetching lessons:", error));
  }, []);

  const links = [
    {
      icon: <LayoutDashboard strokeWidth={1.25} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <BookOpen strokeWidth={1.25} />,
      label: "My Lessons",
      href: "/mylesson",
    },
    {
      icon: <ChartNoAxesColumn strokeWidth={1.25} />,
      label: "Progress Report",
      href: "/progress",
    },
  ];

  const qalinks = [
    {
      icon: <LibraryBig strokeWidth={1.25} />,
      label: "Current Lessons",
      href: firstLessonId ? `/current?id=${firstLessonId}` : "/dashboard", // ✅ Dynamically link
    },
    {
      icon: <Backpack strokeWidth={1.25} />,
      label: "Assignments",
      href: "/assignments",
    },
    {
      icon: <Bell strokeWidth={1.25} />,
      label: "Announcements",
      href: "/announcements",
    },
  ];

  const profilelinks = [
    {
      icon: <UserRound strokeWidth={1.25} />,
      label: "Profile",
      href: "/profile",
    },
    {
      icon: <Bolt strokeWidth={1.25} />,
      label: "Settings",
      href: "/settings",
    },
    {
      icon: <CircleHelp strokeWidth={1.25} />,
      label: "Help",
      href: "/help",
    },
  ];

  const currentPath = usePathname();
  console.log(currentPath);

  // State for the current active label
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  // Update active label when the path changes
  useEffect(() => {
    const link = [...links, ...qalinks].find((link) =>
      currentPath.startsWith(link.href)
    );
    if (link) {
      setActiveLabel(link ? link.label : "Dashboard");
    }
  }, [currentPath]);

  return (
    <>
      <nav className="fixed overflow-hidden top-0 left-0 w-full py-[.3rem] border-b-[0.5px] border-b-[#bebebe] bg-white z-50 ">
        <div
          className={`flex ${
            isAuthenticated ? "justify-between" : "justify-center"
          } mx-6 `}
        >
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="rounded-md hover:bg-gray-200 hover:transition-all p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          )}
          <p className="absolute mt-[6px] ml-[40px]">{activeLabel}</p>
          <Link
            className={`${!isAuthenticated ? "text-center pb-1" : ""}`}
            href={"/dashboard"}
          >
            <Image
              className="p-1"
              src={logo}
              alt="logo"
              height={160}
              width={160}
            />
          </Link>

          {isAuthenticated && (
            <button
              onClick={toggleProfile}
              className="flex place-items-center rounded-md hover:bg-gray-200 hover:transition-all p-1 "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1"
                stroke="currentColor"
                className="size-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`${
          isAuthenticated ? "opacity-100" : "opacity-0 pointer-events-none"
        }}`}
      >
        <nav
          className={`fixed top-12  left-0 w-56 h-[95%] bg-white border-r-[1px] border-b-[#bebebe] transition-transform duration-300 transform font-[300] 
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="mt-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex mx-5 p-2 rounded-md hover:bg-zinc-300 hover:transition-all ${
                  link.href === currentPath ? "bg-[#D7E5F3]" : ""
                }`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
          <div className=" mt-7 mb-3 h-[1px] w-full bg-[#E6E6E6]" />
          <h1 className="ml-5 font-[500] mb-1">Quick Access</h1>
          {qalinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex mx-5 p-2 rounded-md hover:bg-zinc-300 hover:transition-all"
            >
              <span className="mr-3">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Profile Menu */}
      <div>
        <nav
          className={`fixed top-[3rem] right-0 mr-6 rounded-md w-[14rem] h-[17.6rem] bg-white border border-[#bebebe] transition-all duration-300 transform font-[300] text-[14px]
            ${isProfileOpen ? "visible" : "hidden"} `}
        >
          <div id="profile" className="mt-2">
            <div className="w-full flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1"
                stroke="currentColor"
                className="size-14"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </div>
            <div className="text-center mb-6">
              <p className="font-[350]">My Workspace</p>
              <p className="text-[#3C3C3C] font-[250] text-[12px]">
                edrell43@gmail.com
              </p>
            </div>
            {profilelinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex pl-5 p-1 hover:bg-zinc-300 hover:transition-all"
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <div className=" mt-4 mb-1 h-[1px] w-full bg-[#E6E6E6]" />
            <button
              onClick={logout} // Call logout function
              className="flex pl-5 p-1 hover:bg-zinc-300 hover:transition-all w-full text-left"
            >
              <span className="mr-3">
                <LogOut strokeWidth={1.25} />
              </span>
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* overlay for profile menu */}
      {/* {isSidebarOpen && (
        <div onClick={toggleSidebar} className="absolute inset-0 "></div>
      )}
      {isProfileOpen && (
        <div onClick={toggleProfile} className="absolute inset-0"></div>
      )} */}
    </>
  );
};

export default Navbar;
