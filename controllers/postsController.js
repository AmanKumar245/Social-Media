const { success, error } = require("../utils/responseWrapper");
const User = require('../models/User');
const Post = require( '../models/Post' );
const { mapPostOutput } = require("../utils/Utils");
const cloudinary = require('cloudinary').v2;
const createPostController = async (req, res) => {
 try {
    const {caption,postImg} = req.body;
    if(!caption || !postImg){
        return res.send(error(400,"Caption and post is required"));
    }

    const cloudImg = await cloudinary.uploader.upload(postImg,{
        folder: 'PostImg'
    })
    const owner = req._id;
    const user = await User.findById(req._id);
    const post = await Post.create({
        owner,
        caption,
        Image:{
            publicId:cloudImg.public_id ,
            url: cloudImg.url
        },
    });
    user.posts.push(post._id);
    await user.save();
    // return res.status(200).json({ post });
    return res.send(success(201, post))
    
 } catch (e) {
    console.log('this is error ', e)
    return res.status(500).send(error(500, e.message));
 }
};

const likeAndUnlikePost = async (req, res) => {
    try {
        const {postId} = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId).populate('owner');
        if(!post){
            return res.send(error(404,'The post does not exist'));
        }
        if(post.likes.includes(curUserId)){
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);
           
        } else {
            post.likes.push(curUserId); 
        }
        await post.save();
        return res.send(success(200, {post: mapPostOutput(post, req._id)}))
    } catch (e) {
        return res.status(500).send(error(500, e.message));
        
    }

};

const updatePostController = async ( req, res ) => {
  try {
    const {postId, caption} = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId);
    if(!post){
        return res.send(error(404,"This post doesn't exists"));
    }

    if(post.owner.toString() !== curUserId){
        return res.send(error(403, 'You are not the owner of this post'));
    }
    if(caption){
        post.caption = caption;
    }

    await post.save();
    return res.send(success(200, {post: mapPostOutput(post, req._id)}));
    
  } catch (e) {
    return res.send(error(403, e.message));

    
  }
};

const deletePost = async (req, res) =>{
    try {
        const {postId} = req.body;
        const curUserId = req._id;
    
        const post = await Post.findById(postId);
        const curUser = await  User.findById(curUserId);
        if(!post){
            return res.send(error(404,"This post doesn't exists"));
        }
    
        if(post.owner.toString() !== curUserId){
            return res.send(error(403, 'only owner can delete'));

        }

        const index = curUser.post.indexOf(postId);
        curUser.posts.splice(index,1);

        await curUser.save();
        await post.remove();

        return res.send(success(200, 'post delted'))
        
    } catch (e) {
        
    }


}

module.exports = {
    likeAndUnlikePost,
    createPostController,
    updatePostController,
    deletePost
};