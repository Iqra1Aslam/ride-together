import jwt from 'jsonwebtoken'

export const jwt_token_generator = (user_id) => {
    return jwt.sign({ id: user_id }, process.env.JWT_PRIVATE_KEY, { expiresIn: '1Y' })
}

export const jwt_token_verify = (token) => {
    return jwt.verify(token, process.env.JWT_PRIVATE_KEY)
}