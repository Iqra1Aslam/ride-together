
export const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(error.code || 500).json({
            message: error.message,
            success: false
        })
    }
}

// const asyncHandler = (fn) => {
//     return async (req, res, next) => {
//         try {
//             await fn(req, res, next)
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 message: error.message,
//                 success: false
//             })
//         }
//     }}