import React from "react";
import {
  formatPhoneDisplay,
} from "@/lib/patient-contact-links";
import { PhoneContactActions } from "@/app/admin/patients/components/PhoneContactActions";

interface PhoneContactBlockProps {
  phone: string | null | undefined;
  mainContactPhone?: string | null | undefined;
  phoneLabel?: string;
  showMissingChannelsMessage?: boolean;
}

export function PhoneContactBlock({
  phone,
  mainContactPhone,
  phoneLabel = "Teléfono",
  showMissingChannelsMessage = true,
}: PhoneContactBlockProps) {
  const formattedPhone = formatPhoneDisplay(phone);

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-700">
        <span className="font-medium">{phoneLabel}:</span>{" "}
        {formattedPhone}
      </p>

      <PhoneContactActions
        phone={phone}
        mainContactPhone={mainContactPhone}
        showMissingChannelsMessage={showMissingChannelsMessage}
      />
    </div>
  );
}
