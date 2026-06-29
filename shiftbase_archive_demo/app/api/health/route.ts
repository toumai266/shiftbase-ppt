import { okJson } from "@/lib/backend/apiResponse";
import { getAuthoringBackendProvider, isAuthoringBackendEnabled } from "@/lib/backend/containerService";

export async function GET() {
  return okJson({
    ok: true,
    service: "shiftbase",
    authoringBackend: {
      provider: getAuthoringBackendProvider() ?? null,
      enabled: isAuthoringBackendEnabled()
    }
  });
}
