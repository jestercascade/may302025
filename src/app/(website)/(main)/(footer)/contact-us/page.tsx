import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Human Support, Instant Fixes",
  description:
    "Got a problem? Our squad’s on it—no scripts, no bots, just friendly help that actually works.",
};

export default function ContactUs() {
  return (
    <div className={`min-h-screen relative`}>
      <div className="max-w-[1024px] mx-auto pt-8 pb-4 px-7">
        <div className="bg-lightgray/45 border-l-4 border-neutral-200 shadow-sm rounded-lg py-6 px-8">
          <h1 className="font-bold text-2xl">Contact Us</h1>
        </div>
      </div>
      <div className="pt-12 max-w-[1024px] px-[30px] mx-auto">
        <div className="w-[712px] space-y-6 text-xl font-light">
          <p className="font-semibold">Spill it! 💭</p>

          <p>Did your dress arrive two sizes too small?</p>
          <p>
            Or did that "rose gold" necklace turn green by Tuesday?{" "}
            <span className="font-semibold italic">Girl, same.</span>
          </p>
          <div>
            <span className="font-semibold">Confess here</span>: <br />
            <p className="leading-9">
              📧 <span className="font-semibold">Email</span>:{" "}
              <Link
                href="mailto:support@cherlygood.com"
                target="_blank"
                className="text-blue hover:underline"
              >
                support@cherylgood.com
              </Link>
            </p>
          </div>
          <p>
            We’ll respond within{" "}
            <span className="font-semibold">24–48 hours</span>—
            <em>pinky promise</em>.
          </p>
          <p>
            No chatbots. No automated nonsense. Just humans typing away between
            coffee sips and heated debates about <em>"Is sequin a neutral?"</em>
          </p>
          <p>
            <span className="font-semibold">P.S.</span> Emails with photos =
            problems solved <span className="font-semibold">twice as fast</span>
            . <em>(And yes, we’ve seen it all… glitter spills included.)</em>
          </p>
        </div>
      </div>
    </div>
  );
}
