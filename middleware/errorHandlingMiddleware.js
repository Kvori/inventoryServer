import ApiError from "../error/apiError.js"

const ErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message })
    }
    return res.status(500).json({message: "Unexpected error"})
}

export default ErrorHandler