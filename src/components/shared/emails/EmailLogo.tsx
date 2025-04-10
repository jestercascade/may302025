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
        src="https://res.cloudinary.com/dz4xa9ibb/image/upload/v1743169060/logo-gray_auxjru.png"
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
