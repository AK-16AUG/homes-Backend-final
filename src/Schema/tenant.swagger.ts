export const tenantSwaggerDefinitions = {
  components: {
    schemas: {
      Tenant: {
        type: "object",
        required: ["user_id", "property_id", "startDate"],
        properties: {
          id: {
            type: "string",
            description: "Auto-generated ID of the tenant",
          },
          user_id: {
            type: "string",
            description: "Reference to the user (tenant)",
          },
          property_id: {
            type: "string",
            description: "Reference to the property occupied by the tenant",
          },
          startDate: {
            type: "string",
            format: "date",
            description: "Start date of the tenancy",
          },
          payments: {
            type: "array",
            description: "List of payment records made by the tenant",
            items: {
              type: "object",
              properties: {
                dateOfPayment: {
                  type: "string",
                  format: "date",
                  description: "Date when the payment was made",
                },
                modeOfPayment: {
                  type: "string",
                  enum: ["cash", "online"],
                  description: "Mode of payment used",
                },
              },
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Tenant creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Tenant last updated timestamp",
          },
        },
      },
    },
  },

  paths: {
    "/api/tenants": {
      post: {
        summary: "Create a new tenant",
        tags: ["Tenant"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Tenant",
              },
              example: {
                user_id: "60fabc1234a56789bcef0123",
                property_id: "60fabc1234a56789bcef0456",
                startDate: "2025-07-13",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Tenant created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Tenant",
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
        summary: "Get list of all tenants",
        tags: ["Tenant"],
        responses: {
          200: {
            description: "List of tenants",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Tenant",
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/tenants/{id}": {
      get: {
        summary: "Get tenant by ID",
        tags: ["Tenant"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Tenant ID",
          },
        ],
        responses: {
          200: {
            description: "Tenant found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Tenant",
                },
              },
            },
          },
          404: {
            description: "Tenant not found",
          },
        },
      },

      put: {
        summary: "Update tenant details",
        tags: ["Tenant"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Tenant ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Tenant",
              },
              example: {
                startDate: "2025-08-01",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Tenant updated successfully",
          },
          404: {
            description: "Tenant not found",
          },
        },
      },

      delete: {
        summary: "Delete tenant by ID",
        tags: ["Tenant"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Tenant ID",
          },
        ],
        responses: {
          200: {
            description: "Tenant deleted successfully",
          },
          404: {
            description: "Tenant not found",
          },
        },
      },
    },

    "/api/tenants/{id}/payments": {
      put: {
        summary: "Add a new payment for tenant",
        tags: ["Tenant"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Tenant ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  dateOfPayment: {
                    type: "string",
                    format: "date",
                  },
                  modeOfPayment: {
                    type: "string",
                    enum: ["cash", "online"],
                  },
                },
              },
              example: {
                dateOfPayment: "2025-07-13",
                modeOfPayment: "online",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Payment updated successfully",
          },
          400: {
            description: "Invalid payment input",
          },
          404: {
            description: "Tenant not found",
          },
        },
      },
    },
  },
};
