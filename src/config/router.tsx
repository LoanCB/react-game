import Home from "@src/components/Home";
import AuthLayout from "@src/components/layouts/Auth";
import SecureLayout from "@src/components/layouts/Secure";
import NotFound from "@src/components/Not-found";
import Login from "@src/features/auth/components/Login";
import Register from "@src/features/auth/components/Register";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SecureLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "",
        element: <Home />,
      },
    ],
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
]);

export default router;
