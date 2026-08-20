import "./style.css";

import { Link } from "react-router-dom";

import { useUserStore } from "../../../Stores/stores";
import { Img } from "../../Loading";

const logoutUrl = `${process.env.REACT_APP_API_ENDPOINT}/auth/logout`;

type AvatarProps = {
  picture: string;
};

export const Avatar = (props: AvatarProps) => {
  const user = useUserStore();

  return (
    <div className="avatar myonline dropdown hover:cursor-pointer">
      <div tabIndex={0} className="w-10 sm:w-12 rounded-full">
        <Img alt="profile " src={props.picture} className="rounded-full" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-50 right-0 top-14 menu p-2 shadow-xl bg-base-200/80 backdrop-blur-xl border border-white/10 rounded-box w-52"
      >
        <Link to={"settings"}>
          <li className="hover:bg-primary/10 hover:rounded-xl transition-colors">
            <div>Settings</div>
          </li>
        </Link>
        <Link to={`profile/${user.id}`}>
          <li className="hover:bg-primary/10 hover:rounded-xl transition-colors">
            <div>Profile</div>
          </li>
        </Link>
        {process.env.REACT_APP_API_ENDPOINT && (
          <Link onClick={() => user.logout()} to={logoutUrl}>
            <li className="hover:bg-primary/10 hover:rounded-xl transition-colors">
              <div>Logout</div>
            </li>
          </Link>
        )}
      </ul>
    </div>
  );
};
