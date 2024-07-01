import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    // const additionalData = {
    //     uptime: process.uptime().toFixed(2) + " seconds.",
    // }
    // return res.status(200).json(new ApiResponse(200,additionalData, "OK Status, service is working fine."))
    res.status(200).json(new ApiResponse(200, {}, "System is working fine"))
})

export {
    healthcheck
}
    