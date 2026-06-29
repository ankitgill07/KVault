// router.ts
import { createBrowserRouter } from "react-router-dom";
import { appRoutes } from "./AppRoutes";

export const router = createBrowserRouter([...appRoutes]);

export default router;