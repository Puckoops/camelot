import { Card, GoogleSignIn } from "@puckoops/camelot";
import { action, type ExampleOf, type Meta } from "@/docs";

const meta = {
  title: "ui/GoogleSignIn",
  component: GoogleSignIn,
  description:
    "**Google's own button**, drawn by Google's script inside an iframe: outlined in light, filled black in dark, and redrawn when `<html data-theme>` changes. It hands over Google's ID token, which goes to user-svc's `POST /user/oauth` as `id_token`. The client ID here is a placeholder, so pressing the button opens Google's error page; an app passes the client whose authorised JavaScript origins list its own origin.",
  args: { clientId: "000000000000-placeholder.apps.googleusercontent.com", onCredential: action(), onError: action(), text: "signin" },
  argTypes: {
    text: { control: "inline-radio", options: ["signin", "signup", "continue"], description: "Google's wording on the button" },
    clientId: { control: "text", description: "The OAuth client ID" },
    onCredential: { control: false },
    onError: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof GoogleSignIn>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  render: (args) => (
    <div style={{ width: 356 }}>
      <GoogleSignIn {...args} />
    </div>
  ),
  description: "Sign in with Google, at the width of a sign-in card's form.",
};

export const AboveAForm: Example = {
  name: "Above a form",
  render: (args) => (
    <Card style={{ width: 420, gap: 16 }}>
      <GoogleSignIn {...args} text="signup" />
      <p className="small text-4" style={{ textAlign: "center" }}>
        or with your email
      </p>
    </Card>
  ),
  description: "On a sign-up page the button says Sign up with Google, and the email form follows below.",
};
