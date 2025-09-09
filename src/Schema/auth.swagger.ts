export const authSwaggerDefinitions = {
  // Auth models
  User: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        description: "User's email address"
      },
      password: {
        type: "string",
        format: "password",
        description: "User's password (min 6 characters)"
      }
    }
  },
  
  // Auth paths
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User"
              }
            }
          }
        },
        responses: {
          201: {
            description: "User registered successfully"
          },
          400: {
            description: "Invalid input"
          },
          409: {
            description: "User already exists"
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                      description: "JWT access token"
                    },
                    user: {
                      $ref: "#/components/schemas/User"
                    }
                  }
                }
              }
            }
          },
          401: {
            description: "Invalid credentials"
          }
        }
      }
    }
  }
};