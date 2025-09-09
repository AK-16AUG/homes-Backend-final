export const appointmentSwaggerDefinitions = {
  components: {
    schemas: {
      Appointment: {
        type: "object",
        required: ["user_id", "property_id"],
        properties: {
          id: {
            type: "string",
            description: "The auto-generated ID of the appointment",
          },
          user_id: {
            type: "string",
            description: "Reference to the user who created the appointment",
          },
          property_id: {
            type: "string",
            description: "Reference to the property for the appointment",
          },
          phone: {
            type: "string",
            description: "Phone number associated with the appointment",
            nullable: true,
          },
          status: {
            type: "string",
            description: "Status of the appointment",
            default: "Pending",
            enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Date and time when the appointment was created",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Date and time when the appointment was last updated",
          },
        },
      },
    },
  },

  paths: {
    "/api/appointments": {
      post: {
        summary: "Create a new appointment",
        tags: ["Appointment"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Appointment",
              },
              example: {
                user_id: "60e6f8a1c25e5a001cfddf11",
                property_id: "60e6f8a1c25e5a001cfddf22",
                phone: "9876543210",
                status: "Pending",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Appointment created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Appointment",
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
        summary: "Get list of appointments",
        tags: ["Appointment"],
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
          {
            name: "status",
            in: "query",
            description: "Filter by appointment status",
            required: false,
            schema: {
              type: "string",
              enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
            },
          },
        ],
        responses: {
          200: {
            description: "List of appointments",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Appointment" },
                },
              },
            },
          },
        },
      },
    },

    "/api/appointments/{id}": {
      get: {
        summary: "Get an appointment by ID",
        tags: ["Appointment"],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "Appointment ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Appointment details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Appointment",
                },
              },
            },
          },
          404: {
            description: "Appointment not found",
          },
        },
      },
      put: {
        summary: "Update an appointment by ID",
        tags: ["Appointment"],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "Appointment ID",
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
                $ref: "#/components/schemas/Appointment",
              },
              example: {
                phone: "9876543210",
                status: "Confirmed",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Appointment updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Appointment",
                },
              },
            },
          },
          400: {
            description: "Invalid input",
          },
          404: {
            description: "Appointment not found",
          },
        },
      },
      delete: {
        summary: "Delete an appointment by ID",
        tags: ["Appointment"],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "Appointment ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Appointment deleted successfully",
          },
          404: {
            description: "Appointment not found",
          },
        },
      },
    },
  },
};
