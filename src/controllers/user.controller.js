import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from "../utils/ApiError.js"
import { User } from  "../models/user.model.js"
import { uplodOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Someting went wrong while generating refresh & access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check user if already exists: username, email
    // check for images, check for avatar
    // upload them to cloudnary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from responce
    // check for usercreation
    // return res

    const {fullName, email, username, password} =  req.body;
    // console.log("email: ", email);

    if (
        [fullName, email, username, password].some( (field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
       throw new ApiError(409, "User Already exist's") 
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log(req.files)

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uplodOnCloudinary(avatarLocalPath)
    const coverImage = await uplodOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-passwaord -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registring the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // req body => data
    // username or email
    // find the user
    // check password
    // access and refresh token
    // send cookies

    const {email, username, password} = req.body

    if(!username || !email) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) throw new ApiError(404, "User doesn't exist")

    const ispasswaordValid = await user.isPasswordCorrect(password)

    if (!ispasswaordValid) throw new ApiError(401, "Invalid user credentials")
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

})

export { 
    registerUser,
    loginUser
}