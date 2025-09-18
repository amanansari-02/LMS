import { LoginForm } from "@/components/login-form";
// import { GalleryVerticalEnd } from "lucide-react";
import loginImage from "@/assets/login.jpg";
import { useLocation } from "react-router-dom";
import ForgotPasswordForm from "@/components/forgot-password-form";
import ResetPasswordForm from "@/components/reset-password-form";
import { RegisterForm } from "@/components/register-form";
import logo from "@/assets/disprz-logo.svg";

export default function Login() {
  const location = useLocation();

  const authForm = () => {
    switch (location.pathname) {
      case "/login":
        return <LoginForm />;
        break;
      case "/forgot-password":
        return <ForgotPasswordForm />;
        break;
      case "/reset-password":
        return <ResetPasswordForm />;
        break;
      case "/register":
        return <RegisterForm />;
        break;
      default:
        return <LoginForm />;
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            {/* <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc. */}
            <img src={logo} alt="Logo" className="w-24 md:w-28" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{authForm()}</div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={loginImage}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
