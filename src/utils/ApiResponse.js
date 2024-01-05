class ApiResponse {
    constructor(
        statusCode,
        data,
        message = "SUSSCESS",
    ) {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export default ApiResponse