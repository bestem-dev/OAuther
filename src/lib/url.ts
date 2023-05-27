export function getCurrentURL() {
  let currentURL = window.location.origin;
  if (currentURL.includes("localhost"))
    currentURL = "http://127.0.0.1:" + window.location.port;
  return currentURL;
}
