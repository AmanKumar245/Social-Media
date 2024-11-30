const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./dbconnect/dbConnect');
const authRouter= require('./routers/authRouter')
const postRouter= require('./routers/postRouter')
const userRouter = require('./routers/userRouter')
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;


dotenv.config('./.env');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,  
    api_key: process.env.CLOUDINARY_API_KEY,  
    api_secret: process.env.CLOUDINARY_SECRET
});

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


//middleware
app.use(express.json({limit: '10mb'}));
app.use(morgan('common'));
app.use(cookieParser());
app.use(cors({
        credentials: true,
    origin: process.env.CORS_ORIGIN
    
}));




app.use('/auth', authRouter);
app.use('/posts', postRouter)
app.use('/user', userRouter)

app.get('/' , (req, res) =>{
    res.status(200).send('ok server');
})



const PORT = process.env.PORT || 4001;

dbConnect();

app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT} `);
});
module.exports = app;
