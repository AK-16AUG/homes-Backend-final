// property.swagger.js
export const propertySwaggerDefinitions = {
  // Property model definition
  Property: {
    type: "object",
    required: ["property_name", "description", "category", "location"],
    properties: {
      id: {
        type: "string",
        description: "The auto-generated id of the property",
      },
      property_name: {
        type: "string",
        description: "The name of the property",
      },
      description: {
        type: "string",
        description: "Description of the property",
      },
      rate: {
        type: "string",
        description: "Price or rate of the property",
      },
      category: {
        type: "string",
        enum: ["rent", "sale"],
        description: "Type of property listing",
      },
      location: {
        type: "object",
        properties: {
          type: {
            type: "string",
            default: "Point",
          },
          coordinates: {
            type: "array",
            items: {
              type: "number",
            },
            example: ["longitude", "latitude"],
          },
        },
      },
      amenties: {
        type: "array",
        items: {
          type: "string",
        },
        description: "List of amenities",
      },
      services: {
        type: "array",
        items: {
          type: "string",
        },
        description: "List of services",
      },
      images: {
        type: "array",
        items: {
          type: "string",
          format: "url",
        },
        description: "Array of image URLs",
      },
      videos: {
        type: "array",
        items: {
          type: "string",
          format: "url",
        },
        description: "Array of video URLs",
      },
      furnishing_type: {
        type: "string",
        enum: ["Raw", "Semi-furnished", "Fully furnished"],
      },
      city: {
        type: "string",
      },
      state: {
        type: "string",
      },
      bed: {
        type: "integer",
        minimum: 0,
      },
      bathroom: {
        type: "integer",
        minimum: 0,
      },
      availability: {
        type: "boolean",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  // API endpoints documentation
  paths: {
    "/property": {
      post: {
        summary: "Create a new property",
        tags: ["Property"],
        consumes: ["multipart/form-data"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  property_name: { type: "string" },
                  description: { type: "string" },
                  rate: { type: "string" },
                  category: { type: "string", enum: ["rent", "sale"] },
                  "location[type]": { type: "string", default: "Point" },
                  "location[coordinates][]": {
                    type: "array",
                    items: { type: "number" },
                  },
                  amenties: {
                    type: "array",
                    items: { type: "string" },
                  },
                  services: {
                    type: "array",
                    items: { type: "string" },
                  },
                  images: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "binary",
                    },
                  },
                  videos: {
                    type: "array",
                    items: { type: "string" },
                  },
                  furnishing_type: {
                    type: "string",
                    enum: ["Raw", "Semi-furnished", "Fully furnished"],
                  },
                  city: { type: "string" },
                  state: { type: "string" },
                  bed: { type: "integer" },
                  bathroom: { type: "integer" },
                  availability: { type: "boolean" },
                },
                required: [
                  "property_name",
                  "description",
                  "category",
                  "location",
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Property created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Property",
                },
              },
            },
          },
          400: {
            description: "Invalid input",
          },
          500: {
            description: "Server error",
          },
        },
      },
      get: {
        summary: "Get all properties",
        tags: ["Property"],
        responses: {
          200: {
            description: "List of properties",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Property",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/property/{id}": {
      get: {
        summary: "Get property by ID",
        tags: ["Property"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "Property ID",
          },
        ],
        responses: {
          200: {
            description: "Property found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Property",
                },
              },
            },
          },
          404: {
            description: "Property not found",
          },
        },
      },
      put: {
        summary: "Update property by ID",
        tags: ["Property"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Property ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["active", "inactive", "pending", "sold"],
                  },
                  availability: { type: "boolean" },
                  rate: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Property updated successfully",
          },
          404: {
            description: "Property not found",
          },
          403: {
            description: "Admin access required",
          },
        },
      },
      delete: {
        summary: "Delete property by ID",
        tags: ["Property"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Property ID",
          },
        ],
        responses: {
          200: {
            description: "Property deleted successfully",
          },
          404: {
            description: "Property not found",
          },
          403: {
            description: "Admin access required",
          },
        },
      },
    },
    "/property/upload-image": {
      post: {
        summary: "Upload a single property image",
        tags: ["Property"],
        consumes: ["multipart/form-data"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Image uploaded successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    url: {
                      type: "string",
                      format: "url",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "No file uploaded",
          },
          500: {
            description: "Image upload failed",
          },
        },
      },
    },
  },
};
