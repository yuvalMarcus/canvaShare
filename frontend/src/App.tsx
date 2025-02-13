import './App.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Layout from "./components/Layout/Layout.tsx";
import Explore from "./feature/Explore/Explore.tsx";
import Paint from "./feature/Paint/Paint.tsx";
import Register from "./feature/Register/Register.tsx";
import Login from "./feature/Login/Login.tsx";
import Artist from "./feature/Artist/Artist.tsx";
import Search from "./feature/Search/Search.tsx";
import {Bounce, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from "./context/auth.context.tsx";
import ProtectedRoute from "./route/ProtectedRoute.tsx";
import AdminLayout from "./feature/Admin/AdminLayout.tsx";
import Dashboard from "./feature/Admin/Dashboard/Dashboard.tsx";
import PaintsTable from "./feature/Admin/Paints/PaintsTable.tsx";
import UsersTable from "./feature/Admin/Users/UsersTable.tsx";
import ReportsTable from "./feature/Admin/Reports/ReportsTable.tsx";
import Page404 from "./feature/Page404/Page404.tsx";
import TagsTable from "./feature/Admin/Tags/TagsTable.tsx";
import CreateUser from "./feature/Admin/Users/CreateUser/CreateUser.tsx";
import EditUser from "./feature/Admin/Users/EditUser/EditUser.tsx";
import PaintProvider from "./context/paint.context.tsx";

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
        path: "/paint",
        element: <PaintProvider><Paint /></PaintProvider>,
    },
    {
        path: "/paint/:id",
        element: <Paint />,
    },
    {
        path: "/admin",
        element: <ProtectedRoute roles={['admin_view']} />,
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
                        element: <ProtectedRoute roles={['user_view']} />,
                        children: [
                            {
                                index: true,
                                element: <UsersTable />
                            },
                            {
                                path: 'create',
                                element: <ProtectedRoute roles={['user_management']} />,
                                children: [
                                    {
                                        index: true,
                                        element: <CreateUser />
                                    },
                                ]
                            },
                            {
                                path: ':id',
                                element: <ProtectedRoute roles={['user_management']} />,
                                children: [
                                    {
                                        index: true,
                                        element: <EditUser />
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        path: 'paints',
                        element: <ProtectedRoute roles={['paint_view']} />,
                        children: [
                            {
                                index: true,
                                element: <PaintsTable />
                            },
                        ]
                    },
                    {
                        path: 'reports',
                        element: <ProtectedRoute roles={['report_view']} />,
                        children: [
                            {
                                index: true,
                                element: <ReportsTable />
                            },
                        ]
                    },
                    {
                        path: 'tags',
                        element: <ProtectedRoute roles={['tag_view']} />,
                        children: [
                            {
                                index: true,
                                element: <TagsTable />
                            },
                        ]
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
        element: <Layout />,
        children: [
            {
                path: '*',
                element: <Page404 />
            }
        ]
    }
]);

function App() {
  return (
      <AuthProvider>
          <ToastContainer autoClose={2500}
                          hideProgressBar={true}
                          pauseOnHover={false}
                          position="bottom-center"
                          closeOnClick={true}
                          theme={"colored"}
                          transition={Bounce}
          />
          <RouterProvider router={routers} />
      </AuthProvider>
  )
}

export default App
