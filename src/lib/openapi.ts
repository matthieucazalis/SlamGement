// Description OpenAPI 3.0 de l'API REST. Elle est servie telle quelle sur
// /api/v1/openapi.json et lue par la page /api-docs.
const json = (schema: object) => ({ "application/json": { schema } });
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const error = { description: "Error", content: json(ref("Error")) };
const list = (item: string) => ({
  type: "object",
  properties: { data: { type: "array", items: ref(item) } },
});

const projectId = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string" },
  description: "Project identifier",
};
const adrNumber = {
  name: "number",
  in: "path",
  required: true,
  schema: { type: "integer", minimum: 1 },
};
const body = (schema: object) => ({
  required: true,
  content: json(schema),
});

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "SlamGement API",
    version: "1.1.0",
    description:
      "REST API over the same business services as the web interface. Mobile clients sign in with POST /auth/token and send the returned token as `Authorization: Bearer <token>`. Browsers may read with their session cookie, but every write request requires a bearer token (CSRF protection). Permissions (administrator / member) are enforced server-side exactly as in the UI.",
  },
  servers: [{ url: "/api/v1" }],
  security: [{ bearerAuth: [] }, { sessionCookie: [] }],
  paths: {
    "/auth/token": {
      post: {
        summary: "Sign in (mobile): exchange email and password for a token",
        security: [],
        requestBody: body({
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
            deviceName: { type: "string", maxLength: 60 },
          },
        }),
        responses: {
          "200": {
            description: "Token valid for 30 days",
            content: json(ref("TokenResponse")),
          },
          "401": error,
          "429": error,
        },
      },
      delete: {
        summary: "Sign out: revoke the token used for this request",
        responses: { "204": { description: "Token revoked" }, "401": error },
      },
    },
    "/me": {
      get: {
        summary: "Current user",
        responses: {
          "200": {
            description: "The signed-in user",
            content: json(ref("User")),
          },
          "401": error,
        },
      },
    },
    "/me/avatar": {
      put: {
        summary: "Set the profile picture (256 px JPEG/PNG/WebP data URL)",
        requestBody: body({
          type: "object",
          required: ["dataUrl"],
          properties: { dataUrl: { type: "string" } },
        }),
        responses: {
          "200": { description: "Saved" },
          "401": error,
          "422": error,
        },
      },
      delete: {
        summary: "Remove the profile picture",
        responses: { "204": { description: "Removed" }, "401": error },
      },
    },
    "/projects": {
      get: {
        summary: "Projects the user belongs to",
        responses: {
          "200": {
            description: "List of projects",
            content: json(list("Project")),
          },
          "401": error,
        },
      },
    },
    "/projects/{id}": {
      get: {
        summary: "One project and the user's role in it",
        parameters: [projectId],
        responses: {
          "200": { description: "The project", content: json(ref("Project")) },
          "401": error,
          "404": error,
        },
      },
    },
    "/projects/{id}/adrs": {
      get: {
        summary: "Architecture decision records of a project",
        parameters: [
          projectId,
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "PROPOSED",
                "ACCEPTED",
                "REJECTED",
                "DEPRECATED",
                "SUPERSEDED",
              ],
            },
          },
          {
            name: "q",
            in: "query",
            schema: { type: "string", maxLength: 100 },
            description:
              "Text searched in title, context, decision and consequences",
          },
        ],
        responses: {
          "200": {
            description: "List of ADR summaries, newest first",
            content: json(list("AdrSummary")),
          },
          "400": error,
          "401": error,
          "404": error,
        },
      },
      post: {
        summary:
          "Create an ADR (status PROPOSED, number assigned by the server)",
        parameters: [projectId],
        requestBody: body(ref("AdrInput")),
        responses: {
          "201": { description: "Created" },
          "401": error,
          "404": error,
          "422": error,
        },
      },
    },
    "/projects/{id}/adrs/{number}": {
      get: {
        summary: "One ADR with its full content",
        parameters: [projectId, adrNumber],
        responses: {
          "200": { description: "The ADR", content: json(ref("Adr")) },
          "401": error,
          "404": error,
        },
      },
      patch: {
        summary: "Change the status of an ADR (accept, reject, deprecate…)",
        parameters: [projectId, adrNumber],
        requestBody: body({
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: [
                "PROPOSED",
                "ACCEPTED",
                "REJECTED",
                "DEPRECATED",
                "SUPERSEDED",
              ],
            },
            replacement: {
              type: "integer",
              description:
                "Number of the ADR that replaces this one (SUPERSEDED only)",
            },
          },
        }),
        responses: {
          "200": { description: "Updated" },
          "401": error,
          "404": error,
          "409": error,
          "422": error,
        },
      },
    },
    "/projects/{id}/tasks": {
      get: {
        summary: "Kanban tasks of a project",
        parameters: [
          projectId,
          {
            name: "assignee",
            in: "query",
            schema: { type: "string" },
            description: "A member's user id, or `none` for unassigned tasks",
          },
          {
            name: "q",
            in: "query",
            schema: { type: "string", maxLength: 100 },
          },
        ],
        responses: {
          "200": { description: "List of tasks", content: json(list("Task")) },
          "400": error,
          "401": error,
          "404": error,
        },
      },
    },
    "/projects/{id}/tasks/{taskId}": {
      patch: {
        summary: "Move a task to another Kanban column",
        parameters: [
          projectId,
          {
            name: "taskId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: body({
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"],
            },
          },
        }),
        responses: {
          "200": { description: "Moved" },
          "401": error,
          "404": error,
          "422": error,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer" },
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "authjs.session-token",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              fields: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
      TokenResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          expiresAt: { type: "string", format: "date-time" },
          user: ref("User"),
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          avatar: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          role: { type: "string", enum: ["ADMIN", "MEMBER"] },
        },
      },
      AdrInput: {
        type: "object",
        required: ["title", "context", "decision", "consequences"],
        properties: {
          title: { type: "string", minLength: 3 },
          context: { type: "string", minLength: 10 },
          decision: { type: "string", minLength: 10 },
          consequences: { type: "string", minLength: 10 },
          alternatives: { type: "string" },
          mermaidCode: { type: "string" },
        },
      },
      AdrSummary: {
        type: "object",
        properties: {
          number: { type: "integer" },
          title: { type: "string" },
          status: { type: "string" },
          author: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Adr: {
        allOf: [
          ref("AdrSummary"),
          {
            type: "object",
            properties: {
              context: { type: "string" },
              decision: { type: "string" },
              consequences: { type: "string" },
              alternatives: { type: "string", nullable: true },
              mermaidCode: { type: "string", nullable: true },
              supersededBy: { type: "integer", nullable: true },
              supersedes: { type: "integer", nullable: true },
            },
          },
        ],
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: {
            type: "string",
            enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"],
          },
          dueDate: { type: "string", format: "date-time", nullable: true },
          assignee: {
            type: "object",
            nullable: true,
            properties: { id: { type: "string" }, name: { type: "string" } },
          },
          adrNumber: { type: "integer", nullable: true },
        },
      },
    },
  },
} as const;
