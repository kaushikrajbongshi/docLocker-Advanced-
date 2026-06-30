import { getApiDocs } from "@/lib/swagger";
import SwaggerUI from "./SwaggerUI";

export default async function ApiDocPage() {
  const spec = getApiDocs();

  return <SwaggerUI spec={spec} />;
}