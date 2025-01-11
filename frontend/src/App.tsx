import './App.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Layout from "./components/Layout/Layout.tsx";
import Explore from "./feature/Explore/Explore.tsx";
import Canvas from "./feature/Canvas/Canvas.tsx";
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
import CanvasesTable from "./feature/Admin/Canvases/CanvasesTable.tsx";
import UsersTable from "./feature/Admin/Users/UsersTable.tsx";

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
        path: "/canvas",
        element: <Canvas />,
    },
    {
        path: "/canvas/:id",
        element: <Canvas />,
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
