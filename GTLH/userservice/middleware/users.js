const jwt = require("jsonwebtoken");
// middleware/users.js

module.exports = {
    isLoggedIn: (req, res, next) => {
        try {
            let t = req.headers["x-access-token"]
                //console.log(t.toJSON())
            let token = req.headers["x-access-token"]
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userData = decoded;
            next();
        } catch (err) {
            return res.status(401).send({
                msg: 'Your session is not valid!'
            });
        }
    }
}