import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    // const {page = 1, limit = 10} = req.query
    if (!videoId) {
        throw new ApiError(400,"video id is missing")
    }

    const comments = await Comment.aggregate([
        {
            $match:{video: new mongoose.Types.ObjectId(`${videoId}`)}
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        }
    ])

    if(!comments) throw new ApiError(404,"comments not found")

    return res.status(200).json(new ApiResponse(200,comments,"comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {channelId, videoId} = req.params;
    const {content} =req.body;

    if (!channelId || !videoId) throw new ApiError(400,"channel id or video id is missing")

    if(!content) throw new ApiError(400,"comment cannot be empty")

    const comment = await Comment.create(
        {
            content,
            video:videoId,
            owner:channelId
        }
    )

    if (!comment) throw new ApiError(404,"error while creating comment")

    return res.status(200).json(new ApiResponse(200,comment,"comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;

    if (!commentId) throw new ApiError(400,"comment id is required")

    if(!content) throw new ApiError(400,"write something to update")

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {
            new : true
        }
    )
    if (!updatedComment) throw new ApiError(400,"somthing went wrong while updating comment")

    return res.status(200).json(new ApiResponse(200,updatedComment,"comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;

    if (!commentId) throw new ApiError(400,"comment id missing")

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if (!deletedComment) throw new ApiError(400, "error while deleting comment")
    
    return res.status(200).json(new ApiResponse(200,deletedComment,"comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }