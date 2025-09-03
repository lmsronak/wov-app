import { useAtomValue } from "jotai";
import { Navigate, useNavigate } from "react-router";
import { getInitialUserInfo, userInfoAtom } from "@/atoms/user";
import MainLayout from "./layout";
import { useEffect } from "react";
import { toast } from "react-toastify";

const PrivateRoute = () => {
  const userInfo = useAtomValue(userInfoAtom);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("hello");
    var id = setInterval(() => {
      console.log("checking info");
      if (!getInitialUserInfo()) {
        toast.error("Your Session has Expired. Please Login again");
        navigate("/login");
        clearInterval(id);
      }
    }, 3000);

    return () => clearInterval(id);
  }, []);

  return userInfo ? <MainLayout /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
