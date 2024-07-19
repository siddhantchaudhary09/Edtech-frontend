import { Outlet } from "react-router";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import useCourse from "./Hooks/useCourseCaegory";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser, removeUser } from "./Store/authSlice";
import { useEffect, useState } from "react";

const App = () => {
  const { loading, error } = useCourse();
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.post(
          "http://localhost:4000/api/v1/users/getcurrentuser",
          {},
          {
            withCredentials: true,
          }
        );

        const user = response.data?.data;

        if (user) {
          dispatch(addUser(user));
          setLoader(false);
        } else {
          dispatch(removeUser());
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        dispatch(removeUser());
      }
    };

    fetchCurrentUser();
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 text-white">
      <Header />
      <main className="flex-grow mt-20 shadow-[0_4px_6px_-1px_rgba(255,255,255,0.5),_0_2px_4px_-2px_rgba(255,255,255,0.3)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
