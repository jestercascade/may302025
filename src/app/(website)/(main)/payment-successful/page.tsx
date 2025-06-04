import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>;
}): Promise<Metadata> {
  const { email } = await searchParams;

  return {
    title: "Payment Successful, Thanks So Much!",
    alternates: {
      canonical: `/payment-successful?email=${email}`,
    },
  };
}

const INVALID_PARAMS_REDIRECT_PATH = "/";
const PAYMENT_SUCCESS_COOKIE_NAME = "payment_success";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function PaymentSuccessful({ searchParams }: { searchParams: Promise<{ email: string }> }) {
  const { email } = await searchParams;

  let normalizedEmail: string;
  try {
    normalizedEmail = decodeURIComponent(email).trim();

    if (!isValidEmail(normalizedEmail)) {
      redirect(INVALID_PARAMS_REDIRECT_PATH);
    }
  } catch {
    redirect(INVALID_PARAMS_REDIRECT_PATH);
  }

  const cookieStore = await cookies();
  const paymentSuccessCookie = cookieStore.get(PAYMENT_SUCCESS_COOKIE_NAME);

  if (!paymentSuccessCookie?.value) {
    redirect(INVALID_PARAMS_REDIRECT_PATH);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-137px)] flex items-center justify-center">
      <div className="text-center -mt-28">
        <div className="pt-12">
          <h1 className="text-2xl sm:text-[1.75rem] font-semibold mb-3">Payment successful, thanks so much!</h1>
          <p className="text-sm sm:text-base">We're sending confirmation to</p>
          <p className="text-blue font-medium break-all">{normalizedEmail}</p>
        </div>
        <Link
          href="/"
          className="mt-11 mx-auto w-max px-8 flex items-center justify-center rounded-full cursor-pointer border border-[#c5c3c0] font-semibold h-12 shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,#faf9f8_5%,#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,#eae8e6_5%,#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
