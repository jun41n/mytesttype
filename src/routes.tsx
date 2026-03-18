import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import PetMbtiTestPage from "./pages/PetMbtiTestPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/pet-mbti-test",
    element: <PetMbtiTestPage />,
  },
]);

export function Routes() {
  return <RouterProvider router={router} />;
}
