import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: 'diw9za1ja',
    api_key: '176149421327148',
    api_secret: 'YQkEy1Y23_uiRxlj3O9SKL63FYg',
})

export const upload_single_on_cloudinary = async (file) => {
    try {
        const file_data = await cloudinary.uploader.upload(file)
            .then(info => {
                console.log(info.url)
                return info.url
            })
            .catch(error => {
                console.log(error.message)
                return error.message
            })

    } catch (error) {
        console.log(error.message)
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