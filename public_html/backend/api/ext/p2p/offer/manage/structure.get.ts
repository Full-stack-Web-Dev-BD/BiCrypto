// /api/p2pOffers/structure.get.ts

import { models } from "@b/db";
import { structureSchema } from "@b/utils/constants";
import { createError } from "@b/utils/error";
import { extensions } from "../../../../../..";

export const metadata = {
  summary: "Get form structure for P2P Offers",
  operationId: "getP2pOfferStructure",
  tags: ["P2P Offers"],
  responses: {
    200: {
      description: "Form structure for managing P2P Offers",
      content: structureSchema,
    },
  },
  requiresAuth: true,
};

export const p2pOfferStructure = async (userId: string) => {
  const paymentMethods = await models.p2pPaymentMethod.findAll({
    where: { status: true, userId },
  });

  const paymentMethodId = {
    type: "select",
    label: "Payment Method ID",
    name: "paymentMethodId",
    options: paymentMethods.map((method) => ({
      value: method.id,
      label: method.name,
    })),
    placeholder: "Select payment method",
  };

  const walletType = {
    type: "select",
    label: "Wallet Type",
    name: "walletType",
    options: [
      { value: "FIAT", label: "Fiat" },
      { value: "SPOT", label: "Spot" },
    ],
    placeholder: "Select wallet type",
  };

  const fiatCurrency = await models.currency.findAll({
    where: { status: true },
    attributes: ["id"],
  });
  const spotCurrency = await models.exchangeCurrency.findAll({
    where: { status: true },
    attributes: ["currency"],
  });

let fundingCurrency: any = [];
if (extensions.has("ecosystem")) {
  walletType.options.push({ value: "ECO", label: "Funding" });
  const allFundingCurrencies = await models.ecosystemToken.findAll({
    where: { status: true },
    attributes: ["currency"],
  });

  // Use a Set to store unique currencies
  const uniqueCurrencies = new Set(allFundingCurrencies.map((c) => c.currency));
  fundingCurrency = Array.from(uniqueCurrencies);
}


  const currency = {
    type: "select",
    label: "Currency",
    name: "currency",
    options: [],
    conditions: {
      walletType: {
        FIAT: fiatCurrency.map((c) => ({ value: c.id, label: c.id })),
        SPOT: spotCurrency.map((c) => ({
          value: c.currency,
          label: c.currency,
        })),
        ECO: fundingCurrency.map((c) => ({
          value: c.currency,
          label: c.currency,
        })),
      },
    },
  };

  const chain = {
    type: "input",
    label: "Chain",
    name: "chain",
    placeholder: "Blockchain network (optional)",
    condition: { walletType: "ECO" },
  };

  const amount = {
    type: "input",
    label: "Total Amount",
    name: "amount",
    placeholder: "Total amount for the offer",
    ts: "number",
  };

  const minAmount = {
    type: "input",
    label: "Minimum Amount",
    name: "minAmount",
    placeholder: "Minimum transaction amount",
    ts: "number",
  };

  const maxAmount = {
    type: "input",
    label: "Maximum Amount",
    name: "maxAmount",
    placeholder: "Maximum transaction amount",
    ts: "number",
  };

  const inOrder = {
    type: "input",
    label: "In Order",
    name: "inOrder",
    placeholder: "Amount currently in order",
    ts: "number",
  };

  const price = {
    type: "input",
    label: "Price per Unit",
    name: "price",
    placeholder: "Set price per unit of currency",
    ts: "number",
  };

  const status = {
    type: "select",
    label: "Status",
    name: "status",
    options: [
      { value: "PENDING", label: "Pending" },
      { value: "ACTIVE", label: "Active" },
      { value: "COMPLETED", label: "Completed" },
      { value: "CANCELLED", label: "Cancelled" },
    ],
    placeholder: "Select the offer status",
  };

  return {
    walletType,
    currency,
    chain,
    amount,
    minAmount,
    maxAmount,
    inOrder,
    price,
    paymentMethodId,
    status,
  };
};

export default async (data: Handler) => {
  const { user } = data;
  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const {
    walletType,
    currency,
    chain,
    minAmount,
    maxAmount,
    price,
    paymentMethodId,
    status,
  } = await p2pOfferStructure(user.id);

  return {
    get: [
      [walletType, chain, currency],
      [paymentMethodId, price],
      [minAmount, maxAmount],
      status,
    ],
    set: [
      [walletType, chain, currency],
      [paymentMethodId, price],
      [minAmount, maxAmount],
    ],
    edit: [
      [paymentMethodId, price],
      [minAmount, maxAmount],
    ],
  };
};