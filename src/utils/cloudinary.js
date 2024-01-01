import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uplodOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null
    //uplod the file
    const responce = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    //file has been uploded successfully
    console.log("file us uploaded on cloudinary", responce.url);
    return responce;
  } catch (error) {
    fs.unlinkSync(localFilePath)  //remove the locally saved temp file as the uplod operation got failed
    return null;
  }
}

export { uplodOnCloudinary }