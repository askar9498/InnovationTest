export const API_URL = import.meta.env.BASE_API_URL;
export const WEB_URL = import.meta.env.BASE_WEB_URL;

export const getApiUrl = (endpoint: string) => `${API_URL}${endpoint}`; 
export const GetBaseUrl =  () => `${API_URL}`;
export const GetWebSiteUrl = () => `${WEB_URL}`