// router.ts
import { createBrowserRouter } from "react-router-dom";
import { appRoutes } from "./AppRoutes";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  ...appRoutes,
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
