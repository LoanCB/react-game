import { createBrowserRouter } from "react-router-dom";
import Home from "./components/Home";
import AuthLayout from "./components/layouts/Auth";
import SecureLayout from "./components/layouts/Secure";
import NotFound from "./components/Not-found";
import Login from "./features/auth/components/Login";
import Register from "./features/auth/components/Register";

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
