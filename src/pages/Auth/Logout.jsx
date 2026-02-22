const logout = async () => {
  const admin = JSON.parse(localStorage.getItem("admin"));

  await axios.post("http://localhost:5000/auth/logout", {
    adminId: admin.id,
  });

  ldocument.addEventListener("visibilitychange", checkIdle);
  window.addEventListener("focus", checkIdle);
  localStorage.clear();
  navigate("/login");
};
