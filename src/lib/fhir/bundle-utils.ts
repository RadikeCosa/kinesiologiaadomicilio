import { type FhirBundle, type FhirBundleEntry, type FhirResource } from "@/lib/fhir/types";

export function extractEntries<TResource extends FhirResource>(bundle: FhirBundle<TResource>): Array<FhirBundleEntry<TResource>> {
  return bundle.entry ?? [];
}

export function extractResourcesByType<TResource extends FhirResource>(
  bundle: FhirBundle,
  resourceType: TResource["resourceType"],
): TResource[] {
  return extractEntries(bundle)
    .map((entry) => entry.resource)
    .filter((resource): resource is TResource => resource?.resourceType === resourceType);
}

export function extractSingleResource<TResource extends FhirResource>(
  bundle: FhirBundle,
  resourceType: TResource["resourceType"],
): TResource | undefined {
  return extractResourcesByType<TResource>(bundle, resourceType)[0];
}
