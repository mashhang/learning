"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import logo from "@/public/logo.png";
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
  X,
} from "lucide-react";
import Image from "next/image";
import ProfileModal from "@/app/components/modals/ProfileModal";
import SettingsModal from "@/app/components/modals/SettingsModal";
import HelpModal from "@/app/components/modals/HelpModal";
import API_URL from "@/lib/getApiUrl";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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
  const { user, logout } = useAuth(); // ✅ Get user from AuthContext

  if (pathname === "/login") return null; // Hide on login
  if (pathname === "/register") return null; // Hide on login

  // State to store first lesson ID
  const [firstLessonId, setFirstLessonId] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`${API_URL}/api/user/${user.id}/top-priority-lesson`)
      .then(async (res) => {
        const text = await res.text(); // ← get the raw response as text first
        try {
          const json = JSON.parse(text); // attempt to parse
          if (json?.id) {
            setFirstLessonId(json.id);
          }
        } catch (err) {
          console.error("❌ Failed to parse JSON. Response was:", text);
        }
      })
      .catch((error) => {
        console.error("Error fetching top-priority lesson:", error);
      });
  }, [user]);

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
      // href: firstLessonId ? `/current?id=${firstLessonId}` : "/current", // ✅ Dynamically link
      // href: firstLessonId ? `/current?id=${firstLessonId}` : "/current", // ✅ Use dynamic top-priority lesson
      href: firstLessonId ? `/current?id=${firstLessonId}` : "#", // safer fallback
    },
    // {
    //   icon: <Backpack strokeWidth={1.25} />,
    //   label: "Assignments",
    //   href: "/assignments",
    // },
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
      action: () => setModalContent("profile"),
    },
    {
      icon: <Bolt strokeWidth={1.25} />,
      label: "Settings",
      action: () => setModalContent("settings"),
    },
    {
      icon: <CircleHelp strokeWidth={1.25} />,
      label: "Help",
      action: () => setModalContent("help"),
    },
  ];

  const currentPath = usePathname();
  console.log(currentPath);

  // State for the current active label
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const isActive = (linkHref: string) => {
    const basePath = linkHref.split("?")[0]; // Remove query parameters from href
    return currentPath.startsWith(basePath);
  };

  // Update active label when the path changes
  // useEffect(() => {
  //   const link = [...links, ...qalinks].find((link) =>
  //     currentPath.startsWith(link.href)
  //   );
  //   if (link) {
  //     setActiveLabel(link ? link.label : "Dashboard");
  //   }
  // }, [currentPath]);
  useEffect(() => {
    // Ensure the dynamic "Current Lessons" link is properly handled
    const updatedLinks = [...links, ...qalinks].map((link) => ({
      ...link,
      href:
        link.label === "Current Lessons" && firstLessonId
          ? `/current?id=${firstLessonId}`
          : link.href,
    }));

    const activeLink = updatedLinks.find(
      (link) => currentPath.startsWith(link.href.split("?")[0]) // Ignore query params
    );

    if (activeLink) {
      setActiveLabel(activeLink.label);
    }
  }, [currentPath, firstLessonId]);

  // Inside the Navbar component

  // Close the profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        toggleProfile(); // Close profile menu
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModalContent(null); // Close modal
      }
    }
    if (modalContent) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalContent]);

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
              priority
              unoptimized={true}
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
              className={`flex mx-5 p-2 rounded-md hover:bg-zinc-300 hover:transition-all ${
                isActive(link.href) ? "bg-[#D7E5F3]" : ""
              }`}
            >
              <span className="mr-3">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Profile Menu */}
      {isProfileOpen && !modalContent && (
        <div
          ref={profileRef}
          className="fixed top-[3rem] right-0 mr-6 rounded-md w-[14rem] bg-white border border-[#bebebe] shadow-lg z-50"
        >
          <div className="mt-2">
            <div className="w-full flex justify-center">
              <UserRound strokeWidth={1.5} className="size-14" />
            </div>
            <div className="text-center mb-6">
              {/* ✅ Show logged-in user name */}
              <p className="font-[350]">{user?.name || "Guest"}</p>
              <p className="text-[#3C3C3C] font-[250] text-[12px]">
                {user?.email || "No email"}
              </p>
            </div>
            {profilelinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  setModalContent(link.label.toLowerCase());
                  toggleProfile();
                }}
                className="flex w-full pl-5 p-2 hover:bg-zinc-300 text-left"
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </button>
            ))}
            <div className="mt-4 mb-1 h-[1px] w-full bg-[#E6E6E6]" />
            <button
              onClick={() => {
                console.log("Logging out...");
                logout(); // ✅ Call logout function properly
              }}
              className="flex w-full pl-5 p-2 hover:bg-zinc-300 text-left"
            >
              <span className="mr-3">
                <LogOut strokeWidth={1.25} />
              </span>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Centered Popup Modal */}
      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg w-[28rem] p-6 shadow-lg relative"
          >
            <button
              onClick={() => setModalContent(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X strokeWidth={1.5} />
            </button>
            {modalContent === "profile" && user?.id && (
              <ProfileModal userId={user.id} />
            )}
            {modalContent === "settings" && <SettingsModal />}
            {modalContent === "help" && <HelpModal />}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
