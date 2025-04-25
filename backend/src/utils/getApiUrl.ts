export const getApiUrl = () => {
  const useLocal = process.env.USE_LOCAL_API === "false";
  return useLocal ? process.env.LOCAL_API_URL : process.env.PROD_API_URL;
};

export const getFrontendAPIUrl = () => {
  const useLocalFrontend = process.env.USE_LOCAL_FRONTEND === "false";
  return useLocalFrontend
    ? process.env.LOCAL_FRONTEND_API
    : process.env.PROD_FRONTEND_API;
};
