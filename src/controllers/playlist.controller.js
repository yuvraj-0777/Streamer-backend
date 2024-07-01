import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if (!name) throw new ApiError(400, "Name is required")

    const playlist = await Playlist.create(
        {
            name,
            description
        }
    )

    if (!playlist) throw new ApiError(500, "something went wrong while creating playlist")

    playlist.owner = req.user?._id;
    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    //TODO: get user playlists
    if(!userId?.trim() || !isValidObjectId(userId)) throw new ApiError(400, "userId is required or invalid");

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId.trim())
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                name: 1,
                description: 1
            }
        }
    ])

    res.status(200).json(new ApiResponse(200, playlists, "Get user playlists success"))

    // const {playlistId} = req.params
    // if (!playlistId) throw new ApiError(400,"playlist id is missing")

    // // const playlist = await Playlist.findById(playlistId).populate("video");
    // const playlist = await Playlist.aggregate([
    //     {
    //         $match: { _id : new mongoose.Types.ObjectId(playlistId)}
    //     },
    //     {
    //         $lookup:{
    //             from:"videos",
    //             localField:"video",
    //             foreignField:"_id",
    //             as:"video"
    //         }
    //     }
    // ])

    // if (!playlist?.length) throw new ApiError(404,"playlist not found")

    // return res.status(200).json(new ApiResponse(200,playlist,"playlist fetched"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId?.trim() || !isValidObjectId(playlistId)) throw new ApiError(400, "playlistId is required or invalid")

    let playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId.trim())
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "videoOwner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            videoOwner: {
                                $first: "$videoOwner"
                            }
                        }
                    },
                    {
                        $project: {
                            thumbnail: 1,
                            title: 1,
                            duration: 1,
                            views: 1,
                            videoOwner: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }, 
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])

    if(playlist.length > 0) playlist = playlist[0]
    else throw new ApiError(404, "Playlist not found")

    res.status(200).json(new ApiResponse(200, playlist, "Get single playlist success"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!videoId || !playlistId ) throw new ApiError(400, "video id r playlist id is missing");

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) throw new ApiError(404," playlist not found")

    if(!playlist?.video?.includes(videoId)){
        playlist.video.push(videoId);
        await playlist.save();
    }

    return res.status(200).json(new ApiResponse(200,playlist,"video added successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!playlistId?.trim() || !isValidObjectId(playlistId)) throw new ApiError(400, "playlistId is required or invalid")
    
    if(!videoId?.trim() || !isValidObjectId(videoId)) throw new ApiError(400, "videoId is required or invalid")

    const playlist = await Playlist.findById(playlistId.trim());
    if(!playlist) throw new ApiError(404, "Playlist not found")

    if(playlist.owner?.toString() !== req.user?._id?.toString()) throw new ApiError(401, "You cannot remove video from this playlist")

    playlist.videos = playlist.videos.filter(v => v.toString() !== videoId.trim())
    await playlist.save()

    res.status(200).json(new ApiResponse(200, {}, "Remove video from playlist success"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId?.trim() || !isValidObjectId(playlistId)) throw new ApiError(400, "playlistId is required or invalid")

    let playlist = await Playlist.findById(playlistId.trim())
    if(!playlist) throw new ApiError(404, "Playlist not found to update")
    
    if(playlist.owner?.toString() !== req.user?._id?.toString()) throw new ApiError(401, "You cannot delete this playlist")

    await Playlist.findByIdAndDelete(playlist._id)
    res.status(200).json(new ApiResponse(200, {}, "Delete playlist success"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId?.trim() || !isValidObjectId(playlistId)) throw new ApiError(400, "playlistId is required or invalid")

    let playlist = await Playlist.findById(playlistId.trim())
    if(!playlist) throw new ApiError(404, "Playlist not found to update")

    if(playlist.owner?.toString() !== req.user?._id?.toString()) throw new ApiError(401, "You cannot update this playlist")

    const fieldsToUpdate = {}
    if(name?.trim()) fieldsToUpdate["name"] = name.trim()

    if(description?.trim()) fieldsToUpdate["description"] = description.trim()

    playlist = await Playlist.findByIdAndUpdate(playlist._id, {
        $set: {...fieldsToUpdate}
    }, {new:true})

    res.status(200).json(new ApiResponse(200, playlist, "Update playlist success"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}