import React from "react";
import { convertContent } from "./utils";

const CURRENT_YEAR = new Date().getFullYear();

type ContentType = "react" | "html";

export function EmailFooter({
  includeUnsubscribeLink,
  contentType = "react",
  showFirstSeparator = true,
  recipientEmail = "",
}: {
  includeUnsubscribeLink: boolean;
  contentType?: ContentType;
  showFirstSeparator?: boolean;
  recipientEmail?: string;
}) {
  const getUnsubscribeUrl = (email: string) => {
    // Use your actual domain here
    const baseUrl =
      "https://literate-space-palm-tree-pj7j5pjvv5g7f75j5-3000.app.github.dev/";
    const encodedEmail = encodeURIComponent(email);
    return `${baseUrl}/newsletter-unsubscribe?email=${encodedEmail}`;
  };

  const FooterComponent = (
    <div style={{ textAlign: "center", paddingBottom: "40px" }}>
      {showFirstSeparator && (
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "linear-gradient(to right, #FFFFFF, #E0E0E0, #FFFFFF)",
            margin: "40px 0",
          }}
        />
      )}
      <div>
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              lineHeight: 1.5,
              marginBottom: "12px",
            }}
          >
            Need help? Contact us at{" "}
            <a
              href="mailto:hello@cherlygood.com"
              style={{ textDecoration: "underline", color: "#333" }}
            >
              hello@cherlygood.com
            </a>
          </h2>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#333",
              maxWidth: "580px",
              margin: "0 auto",
            }}
          >
            We're here to help with anything you need—questions about your
            order, concerns, or advice on finding the right product. Reach out
            anytime; we're happy to assist!
          </p>
        </div>
        <div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Many thanks,
          </h2>
          <span style={{ fontSize: "14px", fontStyle: "italic" }}>
            from <strong>Cherlygood</strong>
          </span>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          height: "1px",
          background: "linear-gradient(to right, #FFFFFF, #E0E0E0, #FFFFFF)",
          margin: "40px 0",
        }}
      />
      <div>
        <p
          style={{
            fontSize: "12px",
            color: "#8a8a8a",
            marginBottom: "8px",
          }}
        >
          NOTE: This is an auto-generated email. Please do not reply directly.
        </p>
        <div style={{ fontSize: "12px" }}>
          <a
            href="#"
            style={{
              textDecoration: "underline",
              color: "#333",
              marginRight: "12px",
            }}
          >
            Privacy Policy
          </a>
          <a
            href="#"
            style={{
              textDecoration: "underline",
              color: "#333",
              marginRight: "12px",
            }}
          >
            Terms of Service
          </a>
          {includeUnsubscribeLink && (
            <a
              href={recipientEmail ? getUnsubscribeUrl(recipientEmail) : "#"}
              style={{ textDecoration: "underline", color: "#333" }}
            >
              Unsubscribe
            </a>
          )}
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "#8a8a8a",
            marginTop: "8px",
          }}
        >
          © {CURRENT_YEAR} Cherlygood. All rights reserved.
        </p>
      </div>
    </div>
  );

  return convertContent(FooterComponent, contentType);
}
