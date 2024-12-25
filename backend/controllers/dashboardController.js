export const getDashboardData = (req, res) => {
    res.status(200).json({
      message: `Welcome to the dashboard, ${req.user.name}`,
      user: req.user,
    });
  };
  