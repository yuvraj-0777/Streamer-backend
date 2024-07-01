import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!channelId) throw new ApiError(400, "channel Id is missing")

    const subscription = await Subscription.findOne(
        {
            channel: channelId,
            subscriber: req.user._id
        }
    )

    if (!subscription) {
        await Subscription.create(
            {
                channel: channelId,
                subscriber: req.user._id
            }
        )
    } else {
        await Subscription.findByIdAndDelete(subscription._id)
    }

    const subscribed = await Subscription.findOne(
        {
            channel:channelId,
            subscriber: req.user._id
        }
    )

    let isSubscribed
    if(!subscribed) isSubscribed = true
    else isSubscribed = false

    return res.status(200).json(200, isSubscribed, "Subscription status updated")
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId) throw new ApiError(400, "Channel Id is missing")

    const channelSubscriber = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(`${channelId}`)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                subscriber: 1,
                createdAt: 1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, channelSubscriber, "channel's subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) throw new ApiError(400, "subscriber id is required")

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(`${subscriberId}`) }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                channel: 1,
                createdAt: 1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "success"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}