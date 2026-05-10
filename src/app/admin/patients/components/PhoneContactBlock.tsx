import React from "react";
import {
  formatPhoneDisplay,
} from "@/lib/patient-contact-links";
import { PhoneContactActions } from "@/app/admin/patients/components/PhoneContactActions";

interface PhoneContactBlockProps {
  phone: string | null | undefined;
  mainContactPhone?: string | null | undefined;
  entity?: "patient" | "mainContact";
  allowMainContactFallback?: boolean;
  phoneLabel?: string;
  showMissingChannelsMessage?: boolean;
}

export function PhoneContactBlock({
  phone,
  mainContactPhone,
  entity = "patient",
  allowMainContactFallback = true,
  phoneLabel = "Teléfono",
  showMissingChannelsMessage = true,
}: PhoneContactBlockProps) {
  const formattedPhone = formatPhoneDisplay(phone ?? undefined);

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-700">
        <span className="font-medium">{phoneLabel}:</span>{" "}
        {formattedPhone}
      </p>

      <PhoneContactActions
        phone={phone}
        mainContactPhone={allowMainContactFallback ? mainContactPhone : undefined}
        entity={entity}
        showMissingChannelsMessage={showMissingChannelsMessage}
      />
    </div>
  );
}
