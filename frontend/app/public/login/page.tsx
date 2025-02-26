// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Logo from "../../../public/";
// import { useRouter } from "next/navigation";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const router = useRouter();

//   const handleLogin = async () => {
//     const res = await fetch("http://localhost:5001/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await res.json();
//     if (data.token) {
//       localStorage.setItem("token", data.token);
//       alert("Login successful!");
//     } else {
//       alert(data.error);
//     }
//   };

//   const handleRedirectToRegister = () => {
//     router.push("/register");
//   };

//   return (
//     // <div className="max-w-md mx-auto p-4">
//     //   <h2 className="text-xl font-bold">Login</h2>
//     //   <input
//     //     className="block w-full p-2 border"
//     //     placeholder="Email"
//     //     onChange={(e) => setEmail(e.target.value)}
//     //   />
//     //   <input
//     //     className="block w-full p-2 border mt-2"
//     //     type="password"
//     //     placeholder="Password"
//     //     onChange={(e) => setPassword(e.target.value)}
//     //   />
//     //   <button
//     //     className="w-full bg-green-500 text-white p-2 mt-3"
//     //     onClick={handleLogin}
//     //   >
//     //     Login
//     //   </button>
//     // </div>
//     <>
//       <section className="flex flex-col max-w-[265px] h-screen items-center justify-center mx-auto my-auto">
//         <div>
//           <Image src={Logo} alt="logo" width={200} height={200} />
//           <h1 className="text-center font-semibold text-[24px] mt-4">
//             Sign in
//           </h1>
//         </div>

//         <input
//           type="email"
//           placeholder="enter your email"
//           onChange={(e) => setEmail(e.target.value)}
//           className="border-black border-[1px] rounded-xl text-[18px] py-2 px-2 mt-16 mb-5"
//         />
//         <input
//           type="password"
//           placeholder="enter your password"
//           onChange={(e) => setPassword(e.target.value)}
//           className="border-black border-[1px] rounded-xl text-[18px] py-2 px-2 mb-12"
//         />

//         <button
//           className="py-[10px] w-[264px] bg-[#30608E] text-white rounded-xl"
//           onClick={handleLogin}
//         >
//           SIGN IN
//         </button>

//         <div className="mt-[25px] w-full h-[1px] bg-[#D6D6D6]"></div>

//         <p className="text-[#A8A8A8] my-3">Don’t have an account?</p>

//         <button
//           className="py-[10px] w-[264px] border-black border-[1px] text-[#515151] rounded-xl"
//           onClick={handleRedirectToRegister} // Add onClick event
//         >
//           Create New Account
//         </button>
//       </section>
//     </>
//   );
// }
