import { Operation } from "fast-json-patch";

export function isJsonPatchArray(patchOps: any): patchOps is Operation[] {
  return (
    Array.isArray(patchOps) &&
    patchOps.every(
      (op) =>
        typeof op === "object" &&
        typeof op.op === "string" &&
        typeof op.path === "string" &&
        (op.op === "remove" || "value" in op) // 'value' is required for add/replace/test
    )
  );
}
