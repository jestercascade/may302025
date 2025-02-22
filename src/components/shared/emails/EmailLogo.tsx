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
        paddingTop: "36px",
        paddingBottom: "20px",
        width: "max-content",
        margin: "0 auto",
      }}
    >
      <img
        src="https://firebasestorage.googleapis.com/v0/b/project-2456.appspot.com/o/cherlygood-logo-silver.png?alt=media&token=b076f07b-380e-48e3-9e41-24dc3c13ba2d"
        alt="Cherly Good"
        width="240"
        height="60"
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </div>
  );

  return convertContent(LogoComponent, contentType);
}
