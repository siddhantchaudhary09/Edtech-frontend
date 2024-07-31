import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import FirstSection from "../coursebuilder/FirstSection";
import SecondSection from "../coursebuilder/SecondSection";

const CourseForm = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [course, setCourse] = useState({
    courseName: "",
    courseDescription: "",
    whatYouWillLearn: "",
    price: "",
  });
  const handleChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const [published, setPublished] = useState(true);

  const handlePublish = (e) => {
    setPublished(e.target.value);
  };
  const handleconsole = async () => {
    console.log(course);
    console.log(selectedOption);
  };
  const navigate = useNavigate();

  const category = useSelector((state) => state.course.categories);

  const [thumbnail, setThumbnail] = useState(null);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [state, setState] = useState(1); // Managing the stepwise state
  const [loader, setLoader] = useState(false);
  const handleCourseChange = (e) => {
    // console.log(e.target);
    const { name, value } = e.target;
    setCourse({
      ...course,
      [name]: value,
    });
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const [video, setVideo] = useState(null);
  const handleVideoChange = (subIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedSubsections = subsections.map((subsection, i) =>
        i === subIndex
          ? { ...subsection, videoUrl: URL.createObjectURL(file) }
          : subsection
      );
      setSubsections(updatedSubsections);
    }
  };

  const addSection = () => {
    setSections([...sections, { sectionName: "", courseId: "" }]);
  };

  const handleSectionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSections = sections.map((section, idx) =>
      idx === index ? { ...section, [name]: value } : section
    );
    setSections(updatedSections);
  };

  const addSubsection = (sectionIndex) => {
    setSubsections([
      ...subsections,
      { sectionId: sectionIndex, title: "", description: "", videoFile: "" },
    ]);
  };

  const handleSubsectionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSubsections = subsections.map((subsection, idx) =>
      idx === index ? { ...subsection, [name]: value } : subsection
    );
    setSubsections(updatedSubsections);
  };
  const [error, setError] = useState(null);

  const createCourse = async () => {
    try {
      setLoader(true);
      const formData = new FormData();
      formData.append("thumbnail", thumbnail);
      for (const key in course) {
        formData.append(key, course[key]);
      }
      formData.append("category", selectedOption);
      formData.append("isPublished", published);
      const courseResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/courses/create-course`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const courseData = courseResponse.data.data;

      const courseId = courseData._id;

      for (const section of sections) {
        //  console.log(section);
        const sectionResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/courses/create-section`,
          { ...section, courseId },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const sectionData = sectionResponse.data.data;
        const sectionId = sectionData._id;

        for (const subsection of subsections.filter(
          (sub) => sub.sectionId === sections.indexOf(section)
        )) {
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/courses/create-subsection`,
            { ...subsection, sectionId },
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      }
      setLoader(false);
      navigate(`/courses/${courseId}`);
    } catch (error) {
      setLoader(false);
      setError(
        error.response.data.message ||
          error.message ||
          "error in creating course Plase check all field"
      );
      console.error("Error creating course:", error);
    }
  };

  if (loader) return <div>Course creating</div>;

  return (
    <div className=" w-[75%] text-white mx-auto">
      {state === 1 && (
        <FirstSection
          handleThumbnailChange={handleThumbnailChange}
          handleCourseChange={handleCourseChange}
          handleChange={handleChange}
          setState={setState}
          course={course}
          selectedOption={selectedOption}
          category={category}
        />
      )}

      {state === 2 && <SecondSection />}

      {state === 3 && (
        <div>
          <div>
            <select
              className="bg-zinc-700 w-full px-2 py-2 rounded-md mt-2"
              value={published}
              onChange={handlePublish}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
          <button
            className="  w-1/6 mr-4 text-lg bg-blue-500 rounded-md hover:bg-blue-700 text-white font-bold my-4 py-2 px-4 space-x-2"
            onClick={() => setState(2)}
          >
            Previous
          </button>
          <button
            className="   mr-4 text-lg bg-blue-500 rounded-md hover:bg-blue-700 text-white font-bold my-4 py-2 px-4 space-x-2"
            onClick={createCourse}
          >
            Create Course
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default CourseForm;
