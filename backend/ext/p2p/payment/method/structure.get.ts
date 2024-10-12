// /api/p2pPaymentMethods/structure.get.ts

import { structureSchema } from "@b/utils/constants";
import { imageStructure } from "@b/utils/schema/structure";
import { extensions } from "../../../../../..";
import { models } from "@b/db";

export const metadata = {
  summary: "Get form structure for P2P Payment Methods",
  operationId: "getP2pPaymentMethodStructure",
  tags: ["P2P", "Payment Methods"],
  responses: {
    200: {
      description: "Form structure for managing P2P Payment Methods",
      content: structureSchema,
    },
  },
};

export const p2pPaymentMethodStructure = async () => {
  // Define your form fields
  const name = {
    type: "input",
    label: "Name",
    name: "name",
    component: "InfoBlock",
    icon: "material-symbols-light:title",
    placeholder: "Enter the name of the payment method",
  };

  const instructions = {
    type: "textarea",
    label: "Instructions",
    name: "instructions",
    placeholder: "Detailed instructions on how to use this payment method",
  };

  const status = {
    type: "select",
    label: "Active",
    name: "status",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
    ts: "boolean",
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
    component: "InfoBlock",
    icon: "material-symbols-light:title",
    placeholder: "Blockchain network (optional)",
    condition: { walletType: "ECO" },
  };

  return {
    name,
    instructions,
    currency,
    status,
    walletType,
    chain,
  };
};

export default async () => {
  const { name, instructions, currency, status, walletType, chain } =
    await p2pPaymentMethodStructure();

  return {
    get: [
      {
        fields: [
          {
            ...imageStructure,
            width: imageStructure.width / 4,
            height: imageStructure.width / 4,
          },
          {
            fields: [
              name,
              {
                component: "InfoBlock",
                icon: "material-symbols-light:title",
                label: "Type",
                name: "walletType",
              },
              chain,
              currency,
            ],
            grid: "column",
          },
        ],
        className: "card-dashed mb-3 items-center",
      },
      instructions,
      status,
    ],
    set: [
      imageStructure,
      name,
      [walletType, currency, chain],
      instructions,
      status,
    ],
    edit: [imageStructure, instructions],
  };
};
