// export const applyForAdmin = async (user) => {
//   if (!user || !user.email || !user.name) {
//     alert("Your user information is incomplete.");
//     return;
//   }

//   try {
//     const response = await fetch("http://localhost:8000/api/admin/apply", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${localStorage.getItem("token")}`,
//   },
//   body: JSON.stringify({
//     email: user.email,
//     name: user.name,
//   }),
// });

//     let result = {};
//     try {
//       result = await response.json();
//     } catch (err) {
//       console.warn("Empty or invalid JSON response");
//     }

//     if (response.ok) {
//       alert("✅ Your request for admin access has been sent successfully.");
//     } else {
//       alert(`❌ Failed to send request: ${result.message || "Unknown error."}`);
//     }
//   } catch (error) {
//     console.error("Apply for admin error:", error);
//     alert("❌ An unexpected error occurred while sending your request.");
//   }
// };

export const applyForAdmin = async (user) => {
  if (!user || !user.email || !user.name) {
    alert(
      "⚠️ Your user information is incomplete. Please provide both name and email."
    );
    return;
  }

  const confirmed = window.confirm(
    `TaskForge\n\nAre you sure you want to apply for admin access?\n\nThis will send a token to your email: ${user.email}`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/api/admin/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
      }),
    });

    let result = {};
    try {
      result = await response.json();
    } catch (err) {
      console.warn("Empty or invalid JSON response");
    }

    if (response.ok) {
      showToast("✅ TaskForge: Admin token sent successfully to your email.");
    } else {
      showToast(
        `❌ TaskForge: Failed to send request — ${
          result.message || "Unknown error."
        }`
      );
    }
  } catch (error) {
    console.error("Apply for admin error:", error);
    showToast("❌ TaskForge: An unexpected error occurred.");
  }
};

// Toast function
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "2rem",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#323232",
    color: "#fff",
    padding: "1rem 1.5rem",
    borderRadius: "6px",
    fontSize: "1rem",
    zIndex: 9999,
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    opacity: "0",
    transition: "opacity 0.3s ease-in-out",
  });

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 4000);
}
