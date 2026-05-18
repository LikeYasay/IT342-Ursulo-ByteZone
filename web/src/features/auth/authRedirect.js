export const getRedirectPathByRole = (role) => {
  if (role === "ADMIN" || role === "STAFF") {
    return "/admindashboard";
  }

  return "/dashboard";
};