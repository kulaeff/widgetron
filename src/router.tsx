import { createBrowserRouter } from "react-router-dom";
import { Editor } from "./app/editor2";
import { NotFoundPage } from "./pages/NotFoundPage";
import { App } from "./App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Editor />
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
