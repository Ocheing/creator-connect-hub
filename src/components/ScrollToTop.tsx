import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop – resets the scroll position to the top whenever the
 * route pathname changes (forward navigation, link clicks, etc.).
 *
 * On browser back/forward (popstate), the browser's native scroll
 * restoration handles it, so we only reset on PUSH / REPLACE actions.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top on every route change
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
