const errorResponse = {
    // Authentication & Authorization Errors
    USER_ALREADY_EXIST: "User already exists",
    USER_NOT_FOUND: "User not found",
    INVALID_CREDENTIALS: "Invalid credentials",
    UNAUTHORIZED_ACCESS: "Unauthorized access",
    FORBIDDEN_ACCESS: "Forbidden access",
    TOKEN_EXPIRED: "Authentication token has expired",
    TOKEN_INVALID: "Invalid authentication token",
    ACCOUNT_LOCKED: "User account is locked",
    
    ACCOUNT_DISABLED: "User account is disabled",
    SESSION_EXPIRED: "User session has expired",
NOTIFICATION_NOT_FOUND:"Notification not found",

    // Validation Errors
    BAD_REQUEST: "Bad request",
    INVALID_INPUT: "Invalid input provided",
    MISSING_REQUIRED_FIELDS: "Missing required fields",
    INVALID_EMAIL: "Invalid email format",
    INVALID_PHONE: "Invalid phone number",
    INVALID_PASSWORD: "Password does not meet security requirements",
    UNPROCESSABLE_ENTITY: "Unprocessable entity",
    INVALID_ID: "Invalid ID format",
    INVALID_PAGINATION: "Invalid pagination parameters",

    // Property Errors
    PROPERTY_NOT_FOUND: "Property not found",
    DUPLICATE_PROPERTY: "Property already exists",
    PROPERTY_UPDATE_FAILED: "Failed to update property",
    PROPERTY_DELETE_FAILED: "Failed to delete property",
    INVALID_PROPERTY_TYPE: "Invalid property type",
    INVALID_PROPERTY_STATUS: "Invalid property status",
    PROPERTY_ALREADY_BOOKED: "Property is already booked",
    PROPERTY_NOT_AVAILABLE: "Property is not available",

    // Visit/Booking Errors
    VISIT_NOT_FOUND: "Visit not found",
    VISIT_ALREADY_SCHEDULED: "Visit already scheduled for this property",
    INVALID_VISIT_DATE: "Invalid visit date",
    VISIT_LIMIT_EXCEEDED: "Visit limit exceeded",
    BOOKING_FAILED: "Booking failed",
    BOOKING_NOT_FOUND: "Booking not found",
    BOOKING_ALREADY_EXISTS: "Booking already exists",
    BOOKING_CANCEL_FAILED: "Failed to cancel booking",

    // Resource Errors
    RESOURCE_NOT_FOUND: "Requested resource not found",
    DUPLICATE_RESOURCE: "Duplicate resource detected",
    CONFLICT_ERROR: "Conflict with existing data",
    OPERATION_NOT_ALLOWED: "Operation not allowed",
    DATA_INTEGRITY_VIOLATION: "Data integrity violation",
    DEPENDENT_RESOURCE_EXISTS: "Cannot delete resource as dependent resources exist",

    // Server Errors
    INTERNAL_SERVER_ERROR: "Internal server error",
    SERVICE_UNAVAILABLE: "Service unavailable",
    BAD_GATEWAY: "Bad gateway",
    GATEWAY_TIMEOUT: "Gateway timeout",
    DATABASE_CONNECTION_FAILED: "Database connection failed",
    REQUEST_TIMEOUT: "Request timeout",
    UNKNOWN_ERROR: "An unknown error occurred",

    // Rate Limiting & Throttling
    TOO_MANY_REQUESTS: "Too many requests, please try again later",
    RATE_LIMIT_EXCEEDED: "Rate limit exceeded",

    // File & Upload Errors
    FILE_TOO_LARGE: "File size exceeds the allowed limit",
    UNSUPPORTED_FILE_TYPE: "Unsupported file type",
    FILE_UPLOAD_FAILED: "File upload failed",
    FILE_NOT_FOUND: "File not found",
    FILE_CORRUPTED: "Uploaded file is corrupted",

    // Payment & Transaction Errors
    PAYMENT_FAILED: "Payment failed",
    INVALID_PAYMENT_METHOD: "Invalid payment method",
    INSUFFICIENT_FUNDS: "Insufficient funds",
    TRANSACTION_ERROR: "Transaction processing error",

    // Feature-Specific Errors
    PASSWORD_RESET_FAILED: "Password reset failed",
    EMAIL_NOT_VERIFIED: "Email has not been verified",
    ACTION_NOT_PERMITTED: "This action is not permitted",
    RESOURCE_LOCKED: "Resource is locked",

    // Amenities & Services Errors
    AMENITY_NOT_FOUND: "Amenity not found",
    SERVICE_NOT_FOUND: "Service not found",
    DUPLICATE_AMENITY: "Amenity already exists",
    DUPLICATE_SERVICE: "Service already exists",

    // User Feedback/Lead Errors
    LEAD_NOT_FOUND: "Lead not found",
    DUPLICATE_LEAD: "Lead already exists",
    INVALID_FEEDBACK: "Invalid feedback provided",
};

export default errorResponse;
