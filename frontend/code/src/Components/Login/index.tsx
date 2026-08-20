import { Link } from "react-router-dom";
import pingpong from "../images/pingpong.svg";
import { Button } from "./Assets/Button";
import { GithubButton } from "./Assets/GithubButton";
import { RandomUserButton } from "./Assets/RandomUserButton";
import { useUserStore } from "../../Stores/stores";
import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useState } from "react";
import api from "../../Api/base";

export const Login = () => {
  const userStore = useUserStore();
  const navigate = useNavigate();
  const [randomLoginLoading, setRandomLoginLoading] = useState(false);
  const [randomLoginError, setRandomLoginError] = useState(false);

  const loginAsRandomUser = async () => {
    setRandomLoginError(false);
    setRandomLoginLoading(true);
    try {
      await api.post("/auth/login/random");
      const loggedin = await userStore.login();
      if (loggedin) navigate("/home");
    } catch (error) {
      setRandomLoginError(true);
    } finally {
      setRandomLoginLoading(false);
    }
  };

  useLayoutEffect(() => {
    const check = async () => {
      try {
        const loggedin = await userStore.login();
        if (loggedin) navigate("/home");
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          // This is a 401 error; you can choose to handle it silently
        } else {
          // Handle other errors
        }
      }
    };
    check();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <div className="overflow-hidden flex flex-col items-center justify-center h-screen bg-base-100">
        <div className="flex flex-col items-center gap-y-20">
          <div className="flex flex-col justify-center animate-fade-in-up">
            <img src={pingpong} alt="Logo" className="animate-float" />
          </div>
          <div className="flex flex-col items-center gap-6">
            {process.env.REACT_APP_AUTH_PATH && (
              <Link
                to={process.env.REACT_APP_AUTH_PATH}
                className="animate-fade-in-up [animation-delay:150ms]"
              >
                <Button />
              </Link>
            )}
            {process.env.REACT_APP_GITHUB_AUTH_PATH && (
              <Link
                to={process.env.REACT_APP_GITHUB_AUTH_PATH}
                className="animate-fade-in-up [animation-delay:300ms]"
              >
                <GithubButton />
              </Link>
            )}
            <div className="animate-fade-in-up [animation-delay:450ms]">
              <RandomUserButton
                loading={randomLoginLoading}
                onClick={loginAsRandomUser}
              />
            </div>
            {randomLoginError && (
              <p className="text-error text-sm animate-fade-in-up">
                Couldn't log in as a random user.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
