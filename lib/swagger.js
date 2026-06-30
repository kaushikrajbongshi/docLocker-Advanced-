import { createSwaggerSpec } from "next-swagger-doc";

export function getApiDocs() {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "DocLocker API",
        version: "1.0.0",
        description: "API documentation for DocLocker",
      },
    },
  });

  return spec;
}