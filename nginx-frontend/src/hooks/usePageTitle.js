import { useEffect, useRef } from "react";

const APP_NAME = "DevSocial";

/**
 * Custom hook to update document.title
 * @param {string} [title] - Title of the page
 */
export const usePageTitle = (title) => {
  const prevTitleRef = useRef(document.title);

  useEffect(() => {
    const prevTitle = prevTitleRef.current;

    if (title && String(title).trim() !== "") {
      document.title = `${String(title).trim()} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};

export default usePageTitle;
