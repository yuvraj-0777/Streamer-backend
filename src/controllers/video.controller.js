import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    let sortCriteria = {}
    let videoQuery = {}

    if (userId) videoQuery.userId = userId

    if (query) {
        videoQuery.$or = [
            {title: {$regex: query, $options: 'i'}},
            { description: { $regex: query, $options: 'i' } }
        ]
    }

    if (sortBy && sortType) sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;

    const videos = await Video.find(videoQuery)
    .sort(sortCriteria)
    .skip((page - 1) * limit)
    .limit(limit);
    
    if (!videos) {
        throw new ApiError(400, "error while fetching all videos")
    }
    
    return res.status(200).json(new ApiResponse(200, videos, "videos fetched"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!title) throw new ApiError(400,"title is missing")
    
    if (!thumbnailLocalPath) throw new ApiError(400, "thumbnail not uploaded")
    
    if (!videoLocalPath) throw new ApiError(400, "video is missing")

    const publishedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    const publishedVideo = await uploadOnCloudinary(videoLocalPath);

    if (!publishedVideo) throw new ApiError(500, "error while uploading video")

    if (!publishedThumbnail) throw new ApiError(500,"error while uploading thumbnail ")

    // console.log(publishedVideo);

    const video = await Video.create(
        {
            title,
            description: description || "",
            thumbnail: publishedThumbnail.url,
            videoFile: publishedVideo.url,
            duration: publishedVideo.duration
        }
    )

    video.owner = req.user?._id;
    video.save();

    console.log(video);

    return res.status(200).json(new ApiResponse(200, video, "video uploaded successfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId) throw new ApiError(400, "Video is Unavailable")

    const video = await Video.findById(videoId)

    if (!video) throw new ApiError(500, "Failed while fetching video")

    return res.status(200).json(new ApiResponse(200, video, "Video Featched Successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description}= req.body
    //TODO: update video details like title, description, thumbnail

    if (!videoId) throw new ApiError(400, "Video is Unavailable")

    if (!title && !description) throw new ApiError(400, "Title and description are required")

    const thubbnailLocalPath = req.file?.path

    if (!thubbnailLocalPath) throw new ApiError(400,"thumbnail file is missing")

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail:thumbnail?.url
            }
        },
        {
            new: true
        }
    )

    if(!video) throw new ApiError(500,"error while updating video")

    return res.status(200).json(new ApiResponse(200, video, "Video details updated successfully"))


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) throw new ApiError(400, "Video is missing")

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(200, {}, "Video Deleted successfully")
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) throw new ApiError(400, "Video is missing")

    const video = await Video.findById(videoId)

    video.isPublished = !video.isPublished
    video.save()

    return res.status(200).json(200, video, " Publish status Updated")
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}