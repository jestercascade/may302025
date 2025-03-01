import { getNewsletters } from "@/actions/get/newsletters";
import { CreateNewsletterOverlay } from "@/components/admin/Newsletters/CreateNewsletterOverlay";
import { EditNewsletterOverlay } from "@/components/admin/Newsletters/EditNewsletterOverlay";
import NewslettersTable from "@/components/admin/Newsletters/NewslettersTable";
import { SendNewsletterOverlay } from "@/components/admin/Newsletters/SendNewsletterOverlay";
import { Mail, UsersRound } from "lucide-react";

export default async function Storefront() {
  const newsletters = await getNewsletters();
  return (
    <>
      <div className="pt-5 flex flex-col gap-8 w-full max-w-[1016px] mx-auto px-5 min-[1068px]:p-0">
        <div className="w-full flex flex-wrap gap-4">
          <div className="flex flex-col gap-2 items-start w-full max-w-60 min-[375px]:w-[calc(50%-8px)] rounded-xl p-5 relative border bg-white">
            <div className="flex gap-2 items-center">
              <Mail size={16} className="text-gray" />
              <h3 className="text-sm font-normal text-gray">Newsletters</h3>
            </div>
            <span className="text-xl font-semibold text-gray-900">5</span>
          </div>
          <div className="flex flex-col gap-2 items-start w-full max-w-60 min-[375px]:w-[calc(50%-8px)] rounded-xl p-5 relative border bg-white">
            <div className="flex gap-2 items-center">
              <UsersRound size={16} className="text-gray" />
              <h3 className="text-sm font-normal text-gray">Subscribers</h3>
            </div>
            <span className="text-xl font-semibold text-gray-900">120</span>
          </div>
        </div>
        <NewslettersTable newsletters={newsletters} />
      </div>
      <CreateNewsletterOverlay />
      <EditNewsletterOverlay />
      <SendNewsletterOverlay />
    </>
  );
}
