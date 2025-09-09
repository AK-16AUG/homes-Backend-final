export const serviceAmenitiesSwaggerDefinitions = {
  // Component Schemas
  components: {
    schemas: {
      Service: {
        type: "object",
        required: ["name"],
        properties: {
          id: {
            type: "string",
            description: "The auto-generated ID of the service"
            
          },
          name: {
            type: "string",
            description: "The name of the service"
          }
        }
      },
      Amenties: {
        type: "object",
        required: ["name"],
        properties: {
          id: {
            type: "string",
            description: "The auto-generated ID of the amenity"
          },
          name: {
            type: "string",
            description: "The name of the amenity"
          }
        }
      }
    }
  },

  // Paths
  paths: {
    "/api/amentiesservice/create-service": {
      post: {
        summary: "Create a new service",
        tags: ["Service"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Service"
              }
            }
          }
        },
        responses: {
          201: {
            description: "Service created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Service"
                }
              }
            }
          },
          400: {
            description: "Invalid input"
          }
        }
      }
    },
    "/api/amentiesservice/create-amenity": {
      post: {
        summary: "Create a new amenity",
        tags: ["Amenties"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Amenties"
              }
            }
          }
        },
        responses: {
          201: {
            description: "Amenity created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Amenties"
                }
              }
            }
          },
          400: {
            description: "Invalid input"
          }
        }
      }
    }
  }
};
