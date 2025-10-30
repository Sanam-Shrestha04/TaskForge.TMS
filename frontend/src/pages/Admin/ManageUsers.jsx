import React, { useEffect, useState, useContext } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "/src/utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import UserCard from "../../components/Cards/UserCard";
import toast from "react-hot-toast";
import { UserContext } from "../../context/userContext";

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const { user } = useContext(UserContext); //  Access current admin

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  //  Download report of users assigned by current admin
  const handleDownloadReport = async () => {
    if (!user?._id) {
      console.error("User ID is missing");
      toast.error("Cannot download report: user not loaded");
      return;
    }

    try {
      const response = await axiosInstance.get(
        API_PATHS.REPORTS.EXPORT_USERS_ASSIGNED_BY(user._id),
        {
          responseType: "blob",
        }
      );

      if (!response || !response.data || !(response.data instanceof Blob)) {
        throw new Error("Invalid response format");
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "assigned_users_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error("Failed to download. Please try again.");
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="mt-5 mb-10">
        <div className="flex md:flex-row md:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">Team Members</h2>

          <button
            className="flex md:flex download-btn"
            onClick={handleDownloadReport}
          >
            <LuFileSpreadsheet className="text-lg" />
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allUsers?.map((user) => (
            <UserCard key={user._id} userInfo={user} />
          ))}
        </div>
        {console.log("allUsers", allUsers)}
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
