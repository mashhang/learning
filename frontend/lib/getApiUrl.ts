// lib/getApiUrl.ts
const useLocal = process.env.NEXT_PUBLIC_USE_LOCAL_API === "true";

const API_URL = useLocal
  ? process.env.NEXT_PUBLIC_LOCAL_API_URL
  : process.env.NEXT_PUBLIC_PROD_API_URL;

export default API_URL;
