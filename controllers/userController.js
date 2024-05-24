const User = require('../models/User');
const Post = require('../models/Post')
const { error, success } = require("../utils/responseWrapper");
const cloudinary = require('cloudinary').v2
const {mapPostOutput} = require('../utils/Utils')

const followOrUnfollowUserController = async (req, res) => {
    try {
        const { userIdToFollow } = req.body;
        const curUserId = req._id;
        
        const userToFollow = await User.findById(userIdToFollow);
        const curUser = await User.findById(curUserId);

        if(curUserId === userIdToFollow){
            return res.send(error("You can't follow yourself!"));
        }


        if (!userToFollow) {
            return res.send(error(404, "User to follow not found"));
        }

        if (curUser.followings.includes(userIdToFollow)) {
            const followingIndex = curUser.followings.indexOf(userIdToFollow);
            curUser.followings.splice(followingIndex, 1);

            const followerIndex = userToFollow.followers.indexOf(curUser);
            userToFollow.followers.splice(followerIndex, 1);

        } else {
            userToFollow.followers.push(curUserId);
            curUser.followings.push(userIdToFollow);
        }
        await userToFollow.save();
        await curUser.save();
        return res.send(success(200, {user:userToFollow}))
    } catch (e) {
        return res.status(500).send(error(500, e.message));
    }
};

const getPostOfFollowing = async (req, res) => {
   try {
    const curUserId = req._id;

    const curUser = await User.findById(curUserId).populate('followings');

    const fullPosts = await Post.find({
        owner: { 
            '$in': curUser.followings,
         },
    }).populate('owner');

    const posts = fullPosts.map(item => mapPostOutput(item,req._id )).reverse();
   
    const followingsIds = curUser.followings.map(item => item._id);
    followingsIds.push(req._id);
    const suggestions = await User.find({
        _id: {
            $nin: followingsIds 
        }
    })



    return res.send(success(200,{...curUser._doc,suggestions,posts}));
    
   } catch (e) {
    return res.send(error(500, e.message));
    
   }
}

const getMyPosts = async (req, res) => {
    try {

        const curUserId = req._id;
        const allUserPosts = await Post.find({
            owner:curUserId
        }).populate('likes')

        return res.send(success(200, {allUserPosts}))
        
    } catch (e) {
        return res.send(error(500, e.message));
        
    }
}

const getUserPost = async (req, res) =>{
    try {

        const UserId = req.body.UserId;
        if(!UserId){
            return res.send(error(400,"UserId is required"));
        }
        const allUserPosts = await Post.find({
            owner:UserId
        }).populate('likes')

        return res.send(success(200, {allUserPosts}))
        
    } catch (e) {
        return res.send(error(500, e.message));
        
    } 
}

const deleteMyProfile = async (req, res) => {
   try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);
    //delete user's post first

    await Post.deleteMany({
        owner: curUserId
    });
    //then delete the user itself from follower's folowings

    curUser.followers.forEach( async followerId => {
        const follower =  await User.findById(followerId);
        const index = follower.followings.indexOf(curUserId);
        follower.followings.splice(index ,1);
         await follower.save();
    });

    //remove myself from my followings's follower

    curUser.followings.forEach( async followingId => {
        const following =  await User.findById(followingId);
        const index = following.follower.indexOf(curUserId);
        following.follower.splice(index ,1);
       await  following.save();

    })

    //remove myself from all likes
    const allPosts = await Post.find( );
    allPosts.forEach(async post => {
        const index = post.likes.indexOf(curUserId);
        post.likes.splice(index ,1);
        await  post.save();

    })

    await curUser.deleteOne();

    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
    });

    return res.send(success(200, 'user deleted'))
    
   } catch (e) {
    return res.send(error(500, e.message));
   }
};

const getMyInfo = async (req, res ) => {
    

    try {
        
        const user = await User.findById(req._id);
        return res.send(success(200, {user} ))
        
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const {name,bio, userImg} = req.body;
        const user = await User.findById(req._id);

        if(name){
            user.name= name ;  
        }
        if(bio){
            user.bio = bio;
        }
        if(userImg){
            const cloudImg = await cloudinary.uploader.upload(userImg, {
                folder:"UserProfile"
            })
            user.avatar = {
                public_id :cloudImg.public_id ,
                url: cloudImg.secure_url
            }

        }
        await user.save();
        return res.send(success(201,{user}));
        
    } catch (error) {
        
    }

}
const getUserProfile = async (req, res) => {
    try {
        const userID = req.body.userId;
        const user = await User.findById(userID).populate({
            path: "posts",
            populate: {
                path: "owner",
            }
        });
        const fullPosts = user.posts;
        const posts = fullPosts.map(item => mapPostOutput(item,req._id )).reverse();
        
        return res.send(success(200, {...user._doc,posts} ))
    } catch (error) {
        
    }

}

module.exports = {
    followOrUnfollowUserController,
    getPostOfFollowing,
    getMyPosts,
    getUserPost,
    deleteMyProfile ,
    getMyInfo,
    updateUserProfile,
    getUserProfile,
};
