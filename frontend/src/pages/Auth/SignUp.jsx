import React, { useContext, useState } from "react";
import axiosInstance from "/src/utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import { Link, useNavigate } from "react-router-dom";
import uploadImage from "../../utils/uploadImage";
import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "../../components/Inputs/Input";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  //Name validation function
  const validateName = (name) => {
    if (!name) return "Please enter your full name.";
    if (name.length < 3) return "Name must be at least 2 characters long.";
    if (!/^[a-zA-Z\s]+$/.test(name))
      return "Name must contain only letters and spaces.";
    return "";
  };

  // Email validation
  const validateEmail = (email) => {
    if (!email) return "Please enter your email address.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    return ""; // valid
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    let profileImageUrl = "";

    // Validate full name
    const nameError = validateName(fullName);
    if (nameError) return setError(nameError);
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setErrorField("email");
      setErrorMessage(emailError);
      return;
    }
    if (!password) return setError("Please enter your password.");
    setError("");

    //signup API call
    try {
      //Upload image if present
      if (profilePic) {
        const imageUploadRes = await uploadImage(profilePic);
        profileImageUrl = imageUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken,
      });

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
      }

      // Redirect based on role
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };
  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-3/4 md:h-full flex flex-col">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>
        <p className="text-xs text-slate-700 mt-[7px] mb-5 capitalize">
          Join us today by entering your details below.
        </p>

        <div className="flex justify-center mb-6 ">
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
        </div>

        <form onSubmit={handleSignUp}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="Your name"
              type="text"
            />
            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="Email"
              type="email"
            />
            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Password"
              placeholder="Min 8 characters"
              type="password"
            />
            <Input
              value={adminInviteToken}
              onChange={({ target }) => setAdminInviteToken(target.value)}
              label="Admin Invite Token"
              placeholder="Admin only"
              type="text"
            />
          </div>

          {error && <p className="text-sm text-red-500 -mt-2">{error}</p>}

          <button type="submit" className="btn-primary">
            SIGN UP
          </button>

          <p className="text-sm text-gray-600 text-center mt-3">
            Already have an account?{" "}
            <Link className="text-blue-600 font-medium underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
