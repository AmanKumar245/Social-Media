const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { error, success } = require('../utils/responseWrapper');

//signup controller
const signupController =  async (req, res ) =>{
    try{
    const { name, email, password } = req.body;

    if(!email || !password || !name){
        return res.send(error(400, 'Alll field are required'))
    }
    //Checking if the user already exists in the database
    const oldUser =  await User.findOne({email});
    if(oldUser) {
        // return res.status(409).json('Email is already registered')
        return res.send(error(409, 'Email is already registered'))
    }

    const hashesPassword = await bcrypt.hash(password,10);
    const newUser = await User.create({
        name,
        email,
        password : hashesPassword
    });

    // return res.status(201).json({
    //    newUser,
    // });

    return res.send(success(201, 'user created success'))

    }catch(e){
        res.send(error(500, e.message));

    }
};
//login controoler

const loginController =  async (req, res ) =>{
    try{
        const { email, password } = req.body;

        if(!email || !password){
            // return res.status(400).send('All fields are required');
            return res.send(error(400, 'All field are required  '))
        }
        //Checking if the user already exists in the database
        const user =  await User.findOne({email});
        if(!user) {
            // return res.status(404).send('User id not registered')
            return res.send(error(404, 'User id not registered'))

        }
        const matched = await bcrypt.compare(password,user.password);
        if(!matched){
            // return res.status(401).send('Invalid Password');
            return res.send(error(403, 'Invalid Password'))
        }
        const accessToken = generateAceestoken({_id: user._id });
        const refreshToken = generateRefresstoken({_id: user._id});

        res.cookie('jwt', refreshToken, {
            sameSite: 'None',
            httpOnly: true,
            secure: true
        })
        // return res.json({accessToken, });
        return res.send(success(200, {accessToken, UserId: user._id}));

    }  catch(error){ 

    }
}
//this api will check refreshtoken validuty and generate a new acess token
const refreshAcessTokenController = async( req, res ) =>{
    const cookies = req.cookies;
  if(!cookies.jwt){
    // return res.status(400).send("Refresh token is reqired ");
    return res.send(error(401, 'Refresh token in cookeie reqired'));
  }

  const refreshToken = cookies.jwt;

 try {
    const decoded = jwt.verify(
        refreshToken, 
        process.env.REFRESH_TOKEN_PRIVATE_KEY);

        const _id = decoded._id;
        const accessToken = generateAceestoken({_id})

        // return res.status(201).json({acessToken})
        return res.send(success(201, {accessToken}));
} catch (e) {
    // return res.status(401).send('iNVALID rEFRESH toKEN');
    return res.send(error(401, 'Invalid Refersh Token'))
    
}
}
//generate acees token
const generateAceestoken = (data) =>{
    try{
   const token =  jwt.sign(data, process.env.ACESS_TOKEN_PRIVATE_KEY,{
    expiresIn : "1d",
   });
   return token;
}catch(error){
    console.log(error);
}
   
};
//generate refress token
const generateRefresstoken = (data) =>{
    try{
   const token =  jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY,{
    expiresIn : "1y",
   });
   return token;
}catch(error){
    console.log(error);
}
   
};

//logout

const logOutController = async (req , res)=>{

    try {
        res.clearCookie('jwt',{
            httpOnly: true,
            secure: true,

        })

        return res.send(success(200, "Logged Out Successfully"));

        
    } catch (e) {
        return res.send(error(500, e.message));
        
    }

}

module.exports = {
    signupController,
    loginController,
    refreshAcessTokenController,
    logOutController
}