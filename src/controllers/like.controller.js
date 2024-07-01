import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!videoId) throw new ApiError(400, "video id is missing")

    const isLiked = await Like.findOne(
        {
            video: videoId,
            likedBy: req.user._id
        }
    )

    if (!isLiked) {
        const like = await Like.create(
            {
                video: videoId,
                likedBy: req.user._id
            }
        )

        if (!like) throw new ApiError(400, "error while liking")
    } else {
        await Like.findByIdAndDelete(isLiked._id)
    }

    const videoLiked = await Like.findOne(
        {
            video: videoId,
            likedBy: req.user._id
        }
    )

    let isVideoLiked;

    if (!videoLiked) isVideoLiked = false
    else isVideoLiked = true

    return res.status(200).json(new ApiResponse(200, { isVideoLiked }, " video liked"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!commentId) throw new ApiError(400, "comment id is missing")

    const isLiked = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user._id
        }
    )

    if (!isLiked) {
        const like = await Like.create(
            {
                comment: commentId,
                likedBy: req.user._id
            }
        )
        if (!like) throw new ApiError(400, "error while liking comment")
    } else {
        await Like.findByIdAndDelete(isLiked._id)
    }

    const commentLiked = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user._id
        }
    )

    let isCommentLiked;

    if (!commentLiked) isCommentLiked = false
    else isCommentLiked = true

    return res.status(200).json(new ApiResponse(200, { isCommentLiked }, "like status"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!tweetId) throw new ApiError(400, "post id is missing")

    const isLiked = await Like.findOne(
        {
            community: tweetId,
            likedBy: req.user._id
        }
    )

    if (!isLiked) {
        const likedTweet = await Like.create(
            {
                community: tweetId,
                likedBy: req.user._id
            }
        )
        if (!likedTweet) throw new ApiError(400, "error while liking post")

    } else {
        await Like.findByIdAndDelete(isLiked._id);
    }

    const like = await Like.findOne(
        {
            community: tweetId,
            likedBy: req.user._id
        }
    )

    let isTweetLiked

    if (!like) isTweetLiked = false
    else isTweetLiked = true

    return res.status(200).json(new ApiResponse(200, { isTweetLiked}, "tweet like status updated successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.find(
        {
            likedBy: req.user._id,
            video:{$ne: null}
        }
    ).populate("video")

    if (!likedVideos) throw new ApiError(400,"error while fetching liked videos")
    
    return res.status(200).json(new ApiResponse(200,likedVideos,"liked video fetched"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}