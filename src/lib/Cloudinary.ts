import { v2 as cloudinary } from 'cloudinary'
import { promises } from 'dns';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECREAT
});
 
// it will take the img (blob formate) and it will return the url 
const uploadOnCloudnary=async(file:Blob):Promise<String | null >=>{
    if (!file) {
        return null;
    }
    // it will store the img as buffer
    try {
        const arrayBuffer=await file.arrayBuffer()
        const buffer=Buffer.from(arrayBuffer)
        return new Promise((resolve,reject)=>{
            const uploadStream=cloudinary.uploader.upload_stream(
                {resource_type:"auto"},
                (error,result)=>{
                    if(error){
                        reject(error)
                    }else{
                        resolve(result?.secure_url || null)
                    }
                }
            )
            uploadStream.end(buffer)
        })
        
    } catch (error) {
        console.log("cloudinary error: ",error)
        return null
    }
}

export default uploadOnCloudnary