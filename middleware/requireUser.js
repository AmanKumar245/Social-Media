const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/responseWrapper');


module.exports = async (req, res ,next ) => {
    if(!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith('Bearer')
    ) {
        // return res.status(401).send('Authorization header is required');
         return res.send( error (401, 'Authorization header is required'))
       
    }

    const accessToken = req.headers.authorization.split(' ')[1]
    try {
        const decode = jwt.verify(accessToken,
             process.env.ACESS_TOKEN_PRIVATE_KEY
             );
        req._id = decode._id;

        const user = User.findById(req._id);
            if(!user) {

                return res.send(error("User not found"));
            }
        
        next();
    } catch (e) {
        //return res.status(401).send('Invalid Acess Key');
       return res.send(error( 401, 'invalid acceas token'))
       
        
    }
    
   

}