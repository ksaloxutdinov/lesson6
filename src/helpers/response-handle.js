export const successResponse = (res, data, code = 200) => {
    return res.status(code).json({
        statusCode: code,
        message: 'Success',
        data
    });
}

export const errorResponse = (res, message = 'Internal server error', code = 500) => {
    return res.status(code).json({
        statusCode: code,
        message
    });
}