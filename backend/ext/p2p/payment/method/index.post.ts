// /api/p2p/paymentMethods/store.post.ts

import { storeRecord, storeRecordResponses } from "@b/utils/query";
import {
  p2pPaymentMethodStoreSchema,
  p2pPaymentMethodUpdateSchema,
} from "./utils";
import { models } from "@b/db";
import { createError } from "@b/utils/error";

export const metadata: OperationObject = {
  summary: "Stores a new P2P Payment Method",
  operationId: "storeP2PPaymentMethod",
  tags: ["P2P", "Payment Methods"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: p2pPaymentMethodUpdateSchema,
      },
    },
  },
  responses: storeRecordResponses(
    p2pPaymentMethodStoreSchema,
    "P2P Payment Method"
  ),
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { user, body } = data;
  if (!user?.id) throw createError(401, "Unauthorized");

  const { walletType, chain, name, instructions, currency, image, status } =
    body;

  let currencyData;
  switch (walletType) {
    case "FIAT":
      currencyData = await models.currency.findOne({
        where: { id: currency, status: true },
      });
      if (!currency) {
        throw createError(400, "Currency not found");
      }
      break;
    case "SPOT":
      currencyData = await models.exchangeCurrency.findOne({
        where: { currency: currency, status: true },
      });
      if (!currency) {
        throw createError(400, "Currency not found");
      }
      break;
    case "ECO":
      currencyData = await models.ecosystemToken.findOne({
        where: { currency: currency, status: true },
      });
      if (!currency) {
        throw createError(400, "Currency not found");
      }
      break;
    default:
      throw createError(400, "Invalid wallet type");
  }

  return await storeRecord({
    model: "p2pPaymentMethod",
    data: {
      userId: user.id,
      name,
      instructions,
      walletType,
      chain,
      currency,
      image,
      status,
    },
  });
};
