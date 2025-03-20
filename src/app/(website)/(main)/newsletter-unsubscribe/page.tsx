import { NewsletterUnsubscribeButton } from "@/components/website/NewsletterUnsubscribeButton";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}): Promise<Metadata> {
  const { email } = await searchParams;
  const emailValue = Array.isArray(email) ? email[0] : email;
  const encodedEmail = encodeURIComponent(emailValue ?? "");

  return {
    title: "Unsubscribe from Our Newsletter",
    alternates: {
      canonical: `/newsletter-unsubscribe?email=${encodedEmail}`,
    },
  };
}

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
