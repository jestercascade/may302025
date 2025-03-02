import { convertContent } from "./utils";

type ContentType = "react" | "html";

export function EmailLogo({
  contentType = "react",
}: {
  contentType?: ContentType;
}) {
  const LogoComponent = (
    <div
      style={{
        paddingTop: "40px",
        paddingBottom: "40px",
        width: "max-content",
        margin: "0 auto",
      }}
    >
      <img
        src="https://firebasestorage.googleapis.com/v0/b/project-2456.appspot.com/o/cherlygood-1.png?alt=media&token=8828da9d-2219-4e63-9ce9-ca5e51d4f488"
        alt="Cherlygood"
        width="220"
        height="28"
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </div>
  );

  return convertContent(LogoComponent, contentType);
}
