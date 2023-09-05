const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).json("authorization denied, no signed token");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user;

    return next();
  } catch (err) {
    console.log(err);
    res.status(401).json("authorization denied");
  }
};
