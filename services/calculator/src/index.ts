import {
  Calculator,
  CalculatorTotals,
  PressKeyAdapter
} from "@andela-technology/calculator-artifacts";
import { app, bootstrap } from "@andela-technology/eventually";
import { ExpressApp } from "@andela-technology/eventually-express";
//import { PostgresSnapshotStore, PostgresStore } from "@andela-technology/eventually-pg";

void bootstrap(async (): Promise<void> => {
  // store(PostgresStore("calculator"));
  const _app = app(new ExpressApp())
    .with(Calculator, { scope: "public" })
    .with(PressKeyAdapter)
    .with(CalculatorTotals);
  _app.build();
  await _app.listen();
});
