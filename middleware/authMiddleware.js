const authMiddleware = (req, res, next) => {
    if (req.session?.user) {
        req.user = req.session.user
        next()
    } else {
        res.status(401).json({message: 'User is not authorized'})
    }
}

export default authMiddleware