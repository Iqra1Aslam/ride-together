class ApiResponse {
    constructor(status_code = 200, data, message = '') {
        this.status_code = status_code
        this.data = data
        this.message = message
        this.success = status_code < 400
    }
}

export { ApiResponse }