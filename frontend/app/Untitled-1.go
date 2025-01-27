// "use client";

// import { useState } from "react";

// interface NavbarProps {
//   isAuthenticated: boolean;
// }

// const Navbar: React.FC<NavbarProps> = ({ isAuthenticated }) => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const handleMenuToggle = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   return (
//     <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
//       {/* Hamburger Menu */}
//       {isAuthenticated && (
//         <button
//           className="block lg:hidden focus:outline-none"
//           onClick={handleMenuToggle}
//         >
//           <svg
//             className="w-6 h-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M4 6h16M4 12h16M4 18h16"
//             ></path>
//           </svg>
//         </button>
//       )}

//       {/* Logo */}
//       <div className="text-xl font-bold">Logo</div>

//       {/* Navigation Links */}
//       {isAuthenticated && (
//         <div className={`lg:flex ${isMenuOpen ? "block" : "hidden"} lg:block`}>
//           <a href="#" className="px-4 py-2">
//             Home
//           </a>
//           <a href="#" className="px-4 py-2">
//             About
//           </a>
//           <a href="#" className="px-4 py-2">
//             Contact
//           </a>
//         </div>
//       )}

//       {/* Profile Menu */}
//       <div className="relative">
//         <button className="flex items-center focus:outline-none">
//           <span className="ml-2">Profile</span>
//         </button>

//         {/* Dropdown Menu */}
//         <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2">
//           {isAuthenticated ? (
//             <>
//               <a href="#" className="block px-4 py-2 hover:bg-gray-200">
//                 Logout
//               </a>
//               <a href="#" className="block px-4 py-2 hover:bg-gray-200">
//                 Settings
//               </a>
//             </>
//           ) : (
//             <a href="#" className="block px-4 py-2 hover:bg-gray-200">
//               Login
//             </a>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;














// import Link from "next/link";
// import React from "react";

// const Navbar = () => {
//   const links = [{ label: "Profile", href: "/" }];
//   return (
//     <nav className="flex border-b mb-5">
//       <ul className="flex justify-between">
//         <li>
//           <Link href={"/"}>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth="1.5"
//               stroke="currentColor"
//               className="size-6"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
//               />
//             </svg>
//           </Link>
//         </li>

//         {links.map((link) => (
//           <Link key={link.href} href={link.href}>
//             {link.label}
//           </Link>
//         ))}

//         <li>
//           <Link href={"/"}>Logo</Link>
//         </li>
//       </ul>
//     </nav>
//   );
// };

// export default Navbar;




// "transition-transform ml-[14rem] text-black "

// fixed top-12 right-0 mr-8 rounded-md w-40 h-[15rem] bg-white border border-black



// bg-[#D9D9D9]


// profile // className="flex place-items-center px-1 mb-2 rounded-md hover:bg-gray-200 hover:transition-all"




// <div className="flex justify-center items-start">
//         <div className="xl:max-w-[1280px] w-full">
//           <LandingPage />
//         </div>
//       </div>



// 	  <section className="flex md:flex-row flex-col sm:py-16 py-6">
//       <div className="flex justify-center items-start flex-1 flex-col xl-px-0 sm:px-16 px-6">
//         <div className="flex flex-row justify-between items-center w-full">
//           <h1 className="flex-1 font-semibold ss:text-[72px] text-[52px] text-black ss:leading-[100px] leading-[75px]">
//             Your pace, your
//             <br className="sm:block hidden" />{" "}
//             <span className="text-gradient">math.</span>
//           </h1>
//         </div>

//         <p
//           className={`font-normal text-dimWhite text-[18px] leading-[30.8px] max-w-[470px] mt-5`}
//         >
//           Our team of experts uses a methoology to identify the credit cards
//           most likely to fit your needs. We examine annual percentage rates,
//           annual fees.
//         </p>
//       </div>

//       <div
//         className={`flex-1 flex justify-center items-center md:my-0 my-10 relative`}
//       >
//         <Image
//           src={learning}
//           alt="billing"
//           className="w-[100%] h-[100%] relative z-[5]"
//         />
//       </div>
//     </section>