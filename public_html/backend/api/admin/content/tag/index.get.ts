// /server/api/categories/index.get.ts

import { models } from "@b/db";

import { crudParameters, paginationSchema } from "@b/utils/constants";
import {
  getFiltered,
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { tagSchema } from "./utils";

export const metadata: OperationObject = {
  summary: "Lists all categories with pagination and optional filtering",
  operationId: "listCategories",
  tags: ["Admin", "Content", "Tag"],
  parameters: crudParameters,
  responses: {
    200: {
      description:
        "List of categories with optional related posts and pagination",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: tagSchema,
                },
              },
              pagination: paginationSchema,
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Categories"),
    500: serverErrorResponse,
  },
  requiresAuth: true,
  permission: "Access Tag Management",
};

export default async (data: Handler) => {
  const { query } = data;

  return getFiltered({
    model: models.tag,
    query,
    sortField: query.sortField || "name",
    includeModels: [
      {
        model: models.post,
        as: "posts",
        attributes: ["id", "title", "createdAt"],
      },
    ],
  });
};
