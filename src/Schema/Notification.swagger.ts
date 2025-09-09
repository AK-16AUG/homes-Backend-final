export const notificationSwaggerDefinitions = {
  components: {
    schemas: {
      Notification: {
        type: "object",
        required: ["user_id", "property_id", "description"],
        properties: {
          id: {
            type: "string",
            description: "The auto-generated ID of the notification",
          },
          user_id: {
            type: "string",
            description: "Reference to the user who triggered the notification",
          },
          property_id: {
            type: "string",
            description: "Reference to the property related to the notification",
          },
          description: {
            type: "string",
            description: "Description of the notification",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Date and time when the notification was created",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Date and time when the notification was last updated",
          },
        },
      },
    },
  },

  paths: {
    "/api/notifications": {
      post: {
        summary: "Create a new notification",
        tags: ["Notification"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Notification",
              },
              example: {
                user_id: "60e6f8a1c25e5a001cfddf11",
                property_id: "60e6f8a1c25e5a001cfddf22",
                description: "New property listed in your area",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Notification created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Notification",
                },
              },
            },
          },
          400: {
            description: "Invalid input",
          },
        },
      },
      get: {
        summary: "Get list of notifications",
        tags: ["Notification"],
        parameters: [
          {
            name: "user_id",
            in: "query",
            description: "Filter by user ID",
            required: false,
            schema: {
              type: "string",
            },
          },
          {
            name: "property_id",
            in: "query",
            description: "Filter by property ID",
            required: false,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "List of notifications",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Notification" },
                },
              },
            },
          },
        },
      },
    },

    "/api/notifications/{id}": {
      get: {
        summary: "Get a notification by ID",
        tags: ["Notification"],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "Notification ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Notification details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Notification",
                },
              },
            },
          },
          404: {
            description: "Notification not found",
          },
        },
      },
      put: {
        summary: "Update a notification by ID",
        tags: ["Notification"],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "Notification ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Notification",
              },
              example: {
                description: "Updated notification description",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Notification updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Notification",
                },
              },
            },
          },
          400: {
            description: "Invalid input",
          },
          404: {
            description: "Notification not found",
          },
        },
      },
      delete: {
        summary: "Delete a notification by ID",
        tags: ["Notification"],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "Notification ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Notification deleted successfully",
          },
          404: {
            description: "Notification not found",
          },
        },
      },
    },
  },
};
