// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./backend/src/server.ts"],
  outDir: "backend/dist",
  format: ["cjs"],
  target: "node18",
  platform: "node",
  bundle: true,
  clean: true,
  dts: false,
  noExternal: [/./],
  external: [],
  // swc: {
  //   jsc: {
  //     transform: {
  //       decoratorMetadata: true,
  //       legacyDecorator: true,
  //     },
  //   },
  // },
  // swc: {
  //   jsc: {
  //     transform: {
  //       decoratorMetadata: true,
  //       legacyDecorator: true,
  //     },
  //   },
  // },
});
