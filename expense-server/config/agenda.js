import Agenda from "agenda";

import { DATABASE_URL } from "./env.js";

export const agenda = new Agenda({
  db: { address: DATABASE_URL, collection: "agendaJobs" },
});
