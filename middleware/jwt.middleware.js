const { expressjwt: jwt } = require("express-jwt");

if (!process.env.TOKEN_SECRET) {
  throw new Error("TOKEN_SECRET is not defined in the environment variables");
}

// Instantiate the JWT token validation middleware
const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ["HS256"],
  requestProperty: "payload",
  getToken: getTokenFromHeaders,
});

// Function used to extract the JWT token from the request's 'Authorization' Headers
function getTokenFromHeaders(req) {
  // Check if the token is available on the request Headers
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    // Get the encoded token string and return it
    const token = req.headers.authorization.split(" ")[1];
    return token;
  }
  console.error("No token found in Authorization headers");
  return null;
}

const handleJWTError = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
      return res.status(401).json({ error: "Invalid or missing token" });
  }
  next(err);
};

// Export the middleware so that we can use it to create protected routes
module.exports = {
  isAuthenticated,
  handleJWTError,
};
