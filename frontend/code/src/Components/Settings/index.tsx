import Newbie from "../Badges/Newbie.svg";
import Master from "../Badges/Master.svg";
import Ultimate from "../Badges/Ultimate.svg";
import api from "../../Api/base";
import toast from "react-hot-toast";
import { useState, useMemo } from "react";
import { Inputs } from "./assets/Inputs";
import { useUserStore } from "../../Stores/stores";
import { UploadLogic } from "../FirstLogin/UploadLogic";

import QRCode from "react-qr-code";

import appStoreIcon from "../images/app-store.svg";
import playStoreIcon from "../images/play-store.svg";
import googleAuthenticatorIcon from "../images/google-authenticator.svg";
import { useDocumentTitle } from "../../Utils/helpers";

export const Setting = () => {
  useDocumentTitle("Settings");
  const TOTPSecretKey = useMemo(
    () =>
      btoa(Math.random().toString(36) + Math.random().toString(36))
        .toUpperCase()
        .replace(/\+/g, "")
        .replace(/\//g, "")
        .replace(/=/g, "")
        .substring(0, 16),
    [],
  );

  const [TOTPCode, setTOTPCode] = useState("");

  const user = useUserStore();
  const data_names = useMemo(
    () => ["First name", "Last name", "Email", "Username", "Bio"],
    [],
  );
  const payload_objects = useMemo(
    () => ["firstName", "lastName", "email", "Username", "discreption"],
    [],
  );
  const data_content = useMemo(
    () => [user.name.first, user.name.last, user.email, user.username, user.bio],
    [user.name.first, user.name.last, user.email, user.username, user.bio],
  );

  const otpKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ((event.key >= "0" && event.key <= "9") || event.key === "Backspace")
      return true;
    event.preventDefault();
    return false;
  };

  const verifyCode = async (action: "enable" | "disable") => {
    try {
      const response = await api.post("/users/enableTwoFactorAuth", {
        otp: TOTPCode,
        ...(action === "enable" ? { secret: TOTPSecretKey } : {}),
        action,
      });
      user.toggleTfa();
      setTOTPCode("");
      toast.success(response.data.message);
    } catch (e: any) {
      toast.error(e.response.data.message);
    }
  };

  const otpInputClass =
    "w-full max-w-[10rem] text-center border border-base-300/60 bg-base-100/60 rounded-lg tracking-[0.3em] font-lexend text-sm leading-none py-2 outline-none transition focus:border-primary/60";
  const verifyButtonClass =
    "rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-primary-content transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40";
  const stepCardClass =
    "flex flex-col justify-between items-center gap-3 p-5 min-h-[13rem] w-full max-w-xs rounded-2xl border border-primary/25 bg-base-100/40";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 font-poppins">
      <div className="flex flex-col gap-2 animate-fade-in-up">
        <span className="font-lexend text-xs uppercase tracking-[0.35em] text-neutral/60">Account</span>
        <h1 className="font-lexend text-3xl font-bold text-neutral">Profile Settings</h1>
        <p className="font-poppins text-sm text-neutral/70">
          Manage your public profile, personal details and account security.
        </p>
      </div>

      <div
        className="animate-fade-in-up rounded-2xl border border-base-300/60 bg-base-200 p-6 shadow-sm sm:p-8"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <UploadLogic />
            <div className="flex flex-col gap-1">
              <span className="font-lexend text-lg font-semibold text-neutral break-words">
                {user.name.first} {user.name.last}
              </span>
              <span className="font-poppins text-sm text-neutral/60 break-words max-w-xs">
                {user.bio || "No bio yet"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <img
              className={`h-12 sm:h-16 xl:h-20 ${
                user?.achievement !== null && user?.achievement >= 0
                  ? ""
                  : "opacity-30"
              }`}
              src={Newbie}
              alt="newbie badge"
            />
            <img
              className={`h-12 sm:h-16 xl:h-20 ${
                user?.achievement !== null && user?.achievement >= 1
                  ? ""
                  : "opacity-30"
              }`}
              src={Master}
              alt="Master badge"
            />
            <img
              className={`h-12 sm:h-16 xl:h-20 ${
                user?.achievement !== null && user?.achievement >= 2
                  ? ""
                  : "opacity-30"
              }`}
              src={Ultimate}
              alt="Ultimate badge"
            />
          </div>
        </div>
      </div>

      <div
        className="animate-fade-in-up rounded-2xl border border-base-300/60 bg-base-200 p-6 shadow-sm sm:p-8"
        style={{ animationDelay: "160ms" }}
      >
        <h2 className="font-lexend text-lg font-semibold text-neutral">Personal information</h2>
        <p className="mb-6 font-poppins text-sm text-neutral/60">
          Click the edit icon next to a field to update it.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {data_names.map((x, index) => (
            <Inputs
              key={index}
              name={x}
              data={data_content[index]}
              payload={payload_objects[index]}
            />
          ))}
        </div>
      </div>

      <div
        className="animate-fade-in-up rounded-2xl border border-base-300/60 bg-base-200 p-6 shadow-sm sm:p-8"
        style={{ animationDelay: "240ms" }}
      >
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="font-lexend text-lg font-semibold text-neutral">Two-factor authentication</h2>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              user.tfa
                ? "border-success/40 bg-success/10 text-success"
                : "border-base-300/60 bg-base-100/60 text-neutral/60"
            }`}
          >
            {user.tfa ? "Enabled" : "Disabled"}
          </span>
        </div>
        <p className="mb-6 font-poppins text-sm text-neutral/60">
          {user.tfa
            ? "Verify a code from your authenticator app to disable two-factor authentication."
            : "Add an extra layer of security to your account with an authenticator app."}
        </p>

        {user.tfa === false ? (
          <div className="flex flex-col lg:flex-row justify-center items-stretch gap-4">
            <div className={stepCardClass}>
              <span className="text-xs font-medium text-neutral/70">Install Google Auth</span>
              <img alt="Google Authenticator" src={googleAuthenticatorIcon} className="w-20 h-20" />
              <div className="w-full grid grid-cols-2 gap-2">
                <img alt="Download on the App Store" src={appStoreIcon} className="w-auto h-8 object-contain" />
                <img alt="Get it on Google Play" src={playStoreIcon} className="w-auto h-8 object-contain" />
              </div>
            </div>
            <div className={stepCardClass}>
              <span className="text-xs font-medium text-neutral/70">Scan the QR</span>
              <div className="rounded-lg bg-white p-2">
                <QRCode
                  value={`otpauth://totp/PingPong:${user.email}?secret=${TOTPSecretKey}&period=30&digits=6&algorithm=SHA1&issuer=PingPong`}
                  className="w-20 h-20"
                />
              </div>
              <span className="text-xs font-medium text-neutral/50 tracking-wider">{TOTPSecretKey}</span>
            </div>
            <div className={stepCardClass}>
              <span className="text-xs font-medium text-neutral/70">Verify your device</span>
              <div className="w-full flex flex-col items-center justify-center gap-2">
                <span id="totp-enable-code-label" className="text-xs font-medium text-neutral/70">
                  Enter your code
                </span>
                <input
                  type="text"
                  placeholder="000000"
                  aria-labelledby="totp-enable-code-label"
                  className={otpInputClass}
                  maxLength={6}
                  onKeyDown={otpKeyDown}
                  value={TOTPCode}
                  onChange={(event) => setTOTPCode(event.target.value || "")}
                />
              </div>
              <button
                className={verifyButtonClass}
                disabled={TOTPCode.length !== 6}
                onClick={() => verifyCode("enable")}
              >
                Verify
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className={stepCardClass}>
              <span className="text-xs font-medium text-neutral/70">Verify your device</span>
              <div className="w-full flex flex-col items-center justify-center gap-2">
                <span id="totp-disable-code-label" className="text-xs font-medium text-neutral/70">
                  Enter your code
                </span>
                <input
                  type="text"
                  placeholder="000000"
                  aria-labelledby="totp-disable-code-label"
                  className={otpInputClass}
                  maxLength={6}
                  onKeyDown={otpKeyDown}
                  value={TOTPCode}
                  onChange={(event) => setTOTPCode(event.target.value || "")}
                />
              </div>
              <button
                className={verifyButtonClass}
                disabled={TOTPCode.length !== 6}
                onClick={() => verifyCode("disable")}
              >
                Verify
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
