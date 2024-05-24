const requireUser = require('../middleware/requireUser')
const router = require('express').Router();
const userController = require('../controllers/userController')

router.post('/follow', requireUser, userController.followOrUnfollowUserController);
router.get('/getFeedData', requireUser, userController.getPostOfFollowing);
router.get('/getMyPost', requireUser, userController.getMyPosts);
router.get('/getUserPost', requireUser, userController.getUserPost);
router.delete('/deleteProfile', requireUser, userController.deleteMyProfile);
router.get('/getMyInfo', requireUser, userController.getMyInfo);
router.put('/', requireUser, userController.updateUserProfile)
router.post('/getUserProfile', requireUser, userController.getUserProfile);


module.exports = router