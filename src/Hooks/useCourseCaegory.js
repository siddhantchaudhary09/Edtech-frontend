import axios from "axios";
import { useDispatch } from "react-redux";
import { addCategories, addCourses, addreviews } from "../Store/courseSlice";
import { useEffect, useCallback, useState } from "react";
const useCourse = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const courses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/courses/showallcourses`
      );

      const categoryResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/courses/showallcategory`
      );
      const reviews = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/courses/review`
      );

      const categoryResponsedata = categoryResponse.data.data;
      const courseResult = response.data.data;
      const reviewresult = reviews.data.data;
      // console.log(courseResult);
      dispatch(addreviews(reviewresult));
      dispatch(addCourses(courseResult));
      dispatch(addCategories(categoryResponsedata));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    courses();
  }, [courses]);

  return { loading, error };
};

export default useCourse;
