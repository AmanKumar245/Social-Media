const mongoose = require('mongoose');

module.exports = async  () =>{
    const mongoUri = 'mongodb+srv://letscode2457:8xx99rCA1EN1tKY2@socialmedia.of4sevj.mongodb.net/?retryWrites=true&w=majority'
    try{
    const connect = await mongoose.connect(mongoUri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,  // Deprecated, but new drivers are required to
    });
    console.log(`MongoDB Connected: ${connect.connection.host}`);
} catch (error) {
    console.log(error);
    process.exit(1);
}

}