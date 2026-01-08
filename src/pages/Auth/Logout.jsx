const logout = async () => {
  const admin = JSON.parse(localStorage.getItem("admin"));

  await axios.post("http://localhost:5000/auth/logout", {
    adminId: admin.id,
  });

  localStorage.removeItem("admin");
  navigate("/login");
};
