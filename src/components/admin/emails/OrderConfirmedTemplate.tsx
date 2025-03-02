import {
  createNonLinkableAddress,
  createNonLinkableEmail,
} from "@/lib/utils/common";

export function OrderConfirmedTemplate() {
  return (
    <div
      style={{
        fontFamily: `"Segoe UI", Tahoma, Geneva, Verdana, sans-serif`,
        color: "#333",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          padding: "40px 20px 68px 20px",
          margin: "0 auto",
          border: "1px solid #e8eaed",
          borderRadius: "8px",
          backgroundColor: "#FAFAFA",
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            paddingTop: "0px",
            paddingBottom: "32px",
            width: "max-content",
            margin: "0 auto",
          }}
        >
          <img
            src="https://firebasestorage.googleapis.com/v0/b/project-2456.appspot.com/o/cherlygood-logo-silver.png?alt=media&token=b076f07b-380e-48e3-9e41-24dc3c13ba2d"
            alt="Cherlygood"
            width={240}
            height={60}
          />
        </div>

        {/* Main Content */}
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "44px" }}>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "12px",
                fontFamily: `"Segoe UI", Tahoma, Geneva, Verdana, sans-serif`,
              }}
            >
              Order Confirmed
            </h1>
            <span
              style={{
                color: "#A86400",
                fontSize: "17px",
                fontWeight: "500",
                lineHeight: "1.5",
              }}
            >
              We’ve received your order and are preparing it now
            </span>
          </div>

          {/* Order Details */}
          <div>
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                #CG2187-W
              </h2>
              <span style={{ fontSize: "14px" }}>
                Received on November 8, 2024
              </span>
            </div>
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                {createNonLinkableEmail("emily.johnson@example.com")}
              </h2>
              <span style={{ fontSize: "14px" }}>
                {createNonLinkableAddress(
                  "1000 5th Ave, New York, NY 10028, USA"
                )}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height: "1px",
              background:
                "linear-gradient(to right, #FFFFFF, #E0E0E0, #FFFFFF)",
              margin: "40px 0",
            }}
          ></div>

          {/* Contact Section */}
          <div>
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  lineHeight: "1.5",
                  marginBottom: "12px",
                }}
              >
                Need help? Contact us at{" "}
                <a
                  href="mailto:hello@cherlygood.com"
                  style={{
                    textDecoration: "underline",
                    color: "#333",
                  }}
                >
                  hello@cherlygood.com
                </a>
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#333",
                  maxWidth: "580px",
                  margin: "0 auto",
                }}
              >
                We’re here to help with anything you need—questions about your
                order, concerns, or advice on finding the right product. Reach
                out anytime; we’re happy to assist!
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
              <span
                style={{
                  fontSize: "14px",
                  fontStyle: "italic",
                }}
              >
                from <strong>Cherlygood</strong>
              </span>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height: "1px",
              background:
                "linear-gradient(to right, #FFFFFF, #E0E0E0, #FFFFFF)",
              margin: "40px 0",
            }}
          ></div>

          {/* Footer */}
          <div>
            <p
              style={{
                fontSize: "12px",
                color: "#8a8a8a",
                marginBottom: "8px",
              }}
            >
              NOTE: This is an auto-generated email. Please do not reply
              directly.
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
                }}
              >
                Terms of Service
              </a>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#8a8a8a",
                marginTop: "8px",
              }}
            >
              © {new Date().getFullYear()} Cherlygood. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
