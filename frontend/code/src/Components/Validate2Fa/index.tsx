import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../Api/base";
import toast from "react-hot-toast";
import { PageLoading } from "../Loading";

export const Validate2Fa = () => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [TOTPCode, setTOTPCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/auth/validatToken/${params.token}`)
      .then((res) => {
        if (!res.data) {
          navigate("/");
        } else setIsLoading(false);
      })
      .catch(() => {});

    // eslint-disable-next-line
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col gap-6 justify-center items-center content-center w-full">
        <div className="flex justify-center items-center gap-x-6">
          <div className="flex flex-col justify-between items-center p-10 h-60 w-60 rounded-2xl border border-base-300 bg-accent">
            <span className="text-sm font-medium h-8 flex items-center justify-center">
              Verify your device
            </span>
            <div className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-medium">Enter your code</span>
              <input
                type="text"
                placeholder="000000"
                className="w-[70%] text-center border border-base-300 bg-base-100 rounded-lg tracking-wider leading-none py-0.5"
                maxLength={6}
                onKeyDown={(event) => {
                  if (
                    (event.key >= "0" && event.key <= "9") ||
                    event.key === "Backspace"
                  )
                    return true;
                  event.preventDefault();
                  return false;
                }}
                value={TOTPCode}
                onChange={(event) => {
                  const value = event.target.value;
                  setTOTPCode(value || "");
                }}
              />
            </div>
            <button
              className="btn btn-primary text-sm !h-8 !min-h-0"
              onClick={async () => {
                try {
                  await api.post("/auth/validate2fa", {
                    otp: TOTPCode,
                    tfaToken: params.token,
                  });
                  navigate("/home");
                } catch (e: any) {
                  toast.error(e.response.data.message);
                }
              }}
            >
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
