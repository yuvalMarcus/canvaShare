import './App.css'
import Home from "./feature/Home/Home.tsx";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import Layout from "./components/Layout/Layout.tsx";
import Explore from "./feature/Explore/Explore.tsx";
import Painter from "./feature/Painter/Painter.tsx";
import Register from "./feature/Register/Register.tsx";
import Login from "./feature/Login/Login.tsx";
import Artist from "./feature/Artist/Artist.tsx";

const routers = createBrowserRouter([
  {
    path: "/",
      element: <Layout />,
      children: [
          {
              index: true,
              element: <Home />
          },
          {
              path: 'register',
              element: <Register />
          },
          {
              path: 'login',
              element: <Login />
          },
          {
              path: 'explore',
              element: <Explore />
          },
          {
              path: 'artist',
              element: <Artist />
          },
      ]
  },
    {
        path: "/painter",
        element: <Painter />,
    },
]);

const queryClient = new QueryClient();

function App() {

  return (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={routers} />
      </QueryClientProvider>
  )
}

export default App
