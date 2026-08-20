import { Link } from "react-router-dom";

import { LeaderBoard } from "./LeaderBoard";

import herosvg from "./assets/Hero.png";
import { useDocumentTitle } from "../../Utils/helpers";

export const Home = (): JSX.Element => {
  useDocumentTitle("Home");
  return (
    <div className="flex flex-col items-center h-full w-full bg-accent container-lg mx-auto px-4 sm:px-8">
      <div className="flex justify-center relative items-start w-full h-auto max-h-48 sm:max-h-96 mt-8 animate-fade-in-up">
        <img
          className="w-full h-full min-h-[150px] object-cover object-center rounded-2xl border border-base-300 transition-transform duration-700 ease-out hover:scale-[1.015]"
          alt="leaderboard hero"
          src={herosvg}
        />

        <div className="w-full h-full absolute inset-0 bg-base-100/50 rounded-2xl flex flex-col items-center justify-around">
          <div className="xl:text-4xl md:text-3xl sm:text-2xl text-xs flex text-neutral font-poppins font-semibold tracking-tight animate-fade-in-up [animation-delay:100ms]">
            READY TO PLAY A GAME?
          </div>

          <Link
            to={"/Play"}
            className="animate-fade-in-up [animation-delay:250ms] transition-all duration-300 flex justify-center items-center px-4 sm:px-8 py-2 sm:py-4 rounded-xl bg-primary hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0 active:scale-95"
          >
            <span className="text-primary-content font-poppins text-xs xl:text-[0.99vw]">
              PLAY NOW
            </span>
          </Link>
        </div>
      </div>

      <div className="flex justify-center relative items-start w-full h-auto animate-fade-in-up [animation-delay:150ms]">
        <LeaderBoard />
      </div>
    </div>
  );
};
