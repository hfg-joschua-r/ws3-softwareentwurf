const jwt = require("jsonwebtoken");

//hier findet sich unsere Methode um zu checken ob ein User eingeloggt ist
module.exports = {
    isLoggedIn: (req, res, next) => {
        try {
            //Das jwt Token wird aus dem Header genommen und dann verglichen 
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