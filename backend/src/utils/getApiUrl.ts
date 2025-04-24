export const getApiUrl = () => {
  const useLocal = process.env.USE_LOCAL_API === "false";
  return useLocal ? process.env.LOCAL_API_URL : process.env.PROD_API_URL;
};
