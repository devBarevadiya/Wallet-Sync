import mongoose, { Schema } from "mongoose";

const mongooseSchema = mongoose.Schema(
  {
    user: { type: Schema.Types.Mixed, required: true },
    accounts: { type: [Schema.Types.Mixed], default: [] },
    budgets: { type: [Schema.Types.Mixed], default: [] },
    headCategories: { type: [Schema.Types.Mixed], default: [] },
    categories: { type: [Schema.Types.Mixed], default: [] },
    groups: { type: [Schema.Types.Mixed], default: [] },
    labels: { type: [Schema.Types.Mixed], default: [] },
    planned: { type: [Schema.Types.Mixed], default: [] },
    payments: { type: [Schema.Types.Mixed], default: [] },
    templates: { type: [Schema.Types.Mixed], default: [] },
    payees: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

const ArchivedDataModel = mongoose.model("ArchivedData", mongooseSchema);

export default ArchivedDataModel;
