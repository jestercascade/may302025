import { NewsletterUnsubscribeButton } from "@/components/website/NewsletterUnsubscribeButton";
import { redirect } from "next/navigation";

const INVALID_EMAIL_REDIRECT_PATH = "/";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function UnsubscribeFromNewsletter({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const { email: emailParam } = await searchParams;

  if (Array.isArray(emailParam) || !emailParam) {
    redirect(INVALID_EMAIL_REDIRECT_PATH);
  }

  try {
    const normalizedEmail = decodeURIComponent(emailParam).trim();

    if (!isValidEmail(normalizedEmail)) {
      redirect(INVALID_EMAIL_REDIRECT_PATH);
    }

    return <NewsletterUnsubscribeButton email={normalizedEmail} />;
  } catch {
    redirect(INVALID_EMAIL_REDIRECT_PATH);
  }
}
