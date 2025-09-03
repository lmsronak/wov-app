import { Outlet, RouterProvider, createBrowserRouter } from "react-router";
// import MainLayout from './components/layout'
import EnergiesScreen from "./screens/EnergyScreen";
import ChakrasScreen from "./screens/ChakrasScreen";
import OrgansScreen from "./screens/OrgansScreen";
import SpacesScreen from "./screens/SpacesScreen";
import ProductsScreen from "./screens/ProductsScreen";
import GlandsScreen from "./screens/GlandsScreen";
import SubscriptionScreen from "./screens/SubscriptionScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import PrivateRoute from "./components/privateRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminRoute from "./components/adminRoute";
import AllUserScreen from "./screens/AllUsersScreen";
import ClientsScreen from "./screens/ClientScreen/ClientListScreen";
import RequireClient from "./components/clientRoute";
import PaymentScreen from "./screens/PaymentScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ManagePlansScreen from "./screens/ManagePlansScreen";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserEditScreen from "./screens/UserEditScreen";
import ReportsScreen from "./screens/ReportsScreen";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoute />,
    errorElement: <h1>Page not found</h1>,
    children: [
      {
        path: "clients",
        element: <ClientsScreen />,
      },
      {
        index: true,
        element: <ClientsScreen />,
      },
      {
        path: "subscription",
        element: <SubscriptionScreen />,
      },
      // {
      //   path: "subscription/payment",
      //   element: <PaymentScreen />,
      // },
      // {
      //   path: "placeorder",
      //   element: <PlaceOrderScreen />,
      // },
      {
        path: "profile",
        element: <ProfileScreen />,
      },
      {
        element: <RequireClient />, // Only allow access if a client is selected
        path: "/clients/:clientId",
        // element: <Outlet />,
        children: [
          {
            index: true,
            element: <EnergiesScreen type="Energy" />,
          },
          {
            path: "energies",
            element: <EnergiesScreen type="Energy" />,
          },
          {
            path: "chakras",
            // element: <ChakrasScreen />,
            element: <EnergiesScreen type="Chakra" />,
          },
          {
            path: "organs",
            // element: <OrgansScreen />,
            element: <EnergiesScreen type="Organ" />,
          },
          {
            path: "spaces",
            // element: <SpacesScreen />,
            element: <EnergiesScreen type="Space" />,
          },
          {
            path: "products",
            // element: <ProductsScreen />,
            element: <EnergiesScreen type="Product" />,
          },
          {
            path: "glands",
            // element: <GlandsScreen />,
            element: <EnergiesScreen type="Gland" />,
          },
          // {
          //   path: "reports",
          //   // element: <GlandsScreen />,
          //   element: <ReportsScreen />,
          // },
        ],
      },
      {
        path: "/admin",
        element: <AdminRoute />,
        children: [
          {
            path: "userlist",
            element: <AllUserScreen />,
          },
          {
            path: "subscriptionlist",
            element: <ManagePlansScreen />,
          },
          // {
          //   path: "user/:id/edit",
          //   element: <UserEditScreen />,
          // },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginScreen />,
  },
  {
    path: "/register",
    element: <RegisterScreen />,
  },
]);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        aria-label="notification"
      />
    </QueryClientProvider>
  );
};

export default App;
