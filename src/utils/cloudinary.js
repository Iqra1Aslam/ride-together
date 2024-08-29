import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: 'diw9za1ja',
    api_key: '176149421327148',
    api_secret: 'YQkEy1Y23_uiRxlj3O9SKL63FYg',
})

export const upload_single_on_cloudinary = async (file) => {
    

    try {
       
        const file_data = await cloudinary.uploader.upload(file.path);
        console.log('Uploaded Image Data:', file_data);
        return file_data.url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload image');
    }
}

export const upload_multiple_on_cloudinary = async (files) => {
    try {
        const uploaded_files = files.map(async (file) => (
            await cloudinary.uploader.upload(file)
        ))
        const result = await Promise.all(uploaded_files)
        console.log(result)
        return result.map(file => file.url)

    } catch (error) {
        console.log(error.message)
    }
}