import { useEffect, useState } from "react";
import AdminPage from "./pages/AdminPage";
import ShowcasePage from "./pages/ShowcasePage";

export default function App() {
    const [pathname, setPathname] = useState(() => window.location.pathname);

    useEffect(() => {
        const handlePopState = () => setPathname(window.location.pathname);
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    if (pathname.startsWith("/gestao-privada-sede")) {
        return <AdminPage />;
    }

    return <ShowcasePage />;
}
