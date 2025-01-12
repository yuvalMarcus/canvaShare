import './App.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Layout from "./components/Layout/Layout.tsx";
import Explore from "./feature/Explore/Explore.tsx";
import Painter from "./feature/Painter/Painter.tsx";
import Register from "./feature/Register/Register.tsx";
import Login from "./feature/Login/Login.tsx";
import Artist from "./feature/Artist/Artist.tsx";
import Search from "./feature/Search/Search.tsx";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from "./context/auth.context.tsx";
import ProtectedRoute from "./route/ProtectedRoute.tsx";
import AdminLayout from "./feature/Admin/AdminLayout.tsx";
import Dashboard from "./feature/Admin/Dashboard/Dashboard.tsx";
import CanvasesTable from "./components/Table/CanvasesTable.tsx";
import UsersTable from "./components/Table/UsersTable.tsx";
import Page404 from "./feature/Page404/Page404.tsx";

const routers = createBrowserRouter([
  {
    path: "/",
      element: <Layout />,
      children: [
          {
              index: true,
              element: <Explore />
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
              path: 'search',
              element: <Search />
          },
          {
              path: 'artist/:id',
              element: <Artist />
          },
      ]
  },
    {
        path: "/painter",
        element: <Painter />,
    },
    {
        path: "/painter/:id",
        element: <Painter />,
    },
    {
        path: "/admin",
        element: <ProtectedRoute />,
        children: [
            {
                path: '*',
                element: <AdminLayout />,
                children: [
                    {
                        index: true,
                        element: <Dashboard />
                    },
                    {
                        path: 'users',
                        element: <UsersTable />
                    },
                    {
                        path: 'canvases',
                        element: <CanvasesTable />
                    },
                    {
                        path: '*',
                        element: <Dashboard />
                    },
                ]
            },
        ]
    },
    {
        path: '*',
        element: <Page404 />
    }
]);

function App() {
  return (
      <AuthProvider>
          <ToastContainer />
          <RouterProvider router={routers} />
      </AuthProvider>
  )
}

export default App
