let baseUrl = "";
const webUrl = import.meta.env.VITE_LIVE_WEB_URL;

switch (window.location.host) {
  case import.meta.env.VITE_LIVE_HOST:
    baseUrl = import.meta.env.VITE_LIVE_URL;
    break;
  case import.meta.env.VITE_LOCAL_HOST:
    baseUrl = import.meta.env.VITE_SERVER_LOCAL_URL;
    break;
  default:
    baseUrl = import.meta.env.VITE_LIVE_URL;
    break;
}

export { baseUrl, webUrl };
