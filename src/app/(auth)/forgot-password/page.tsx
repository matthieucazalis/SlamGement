import { getT } from "@/i18n/server";
import { ForgotPasswordForm } from "./forgot-password-form";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("auth.forgotTitle") };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
