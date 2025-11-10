export const adminAuth = (request, response, next) => {
  try {
    // Get user from token (should be set by auth middleware)
    const user = request.user;

    if (!user) {
      return response.status(401).json({
        error: true,
        success: false,
        message: "User not authenticated",
      });
    }

    // Check if user is admin
    if (user.role !== "ADMIN") {
      return response.status(403).json({
        error: true,
        success: false,
        message: "Access denied! Only admins can access this resource",
      });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error("Error in adminAuth middleware:", error);
    return response.status(500).json({
      message: error.message || "Error in admin authentication",
      success: false,
      error: true,
    });
  }
};
