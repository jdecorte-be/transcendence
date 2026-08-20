import "./style.css";

import { Link } from "react-router-dom";

import { useUserStore } from "../../../Stores/stores";

const logoutUrl = `${process.env.REACT_APP_API_ENDPOINT}/auth/logout`;

type AvatarProps = {
  picture: string;
};

export const Avatar = (props: AvatarProps) => {
  const user = useUserStore();

  return (
    <div className="avatar myonline dropdown hover:cursor-pointer">
      <div tabIndex={0} className="w-10 sm:w-12 rounded-full">
        <img alt="profile " src={props.picture} />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-50 right-0 top-14 menu p-2 shadow bg-base-200 border border-base-300 rounded-box w-52"
      >
        <Link to={"Settings"}>
          <li className="hover:bg-primary/10 hover:rounded-xl transition-colors">
            <div>Settings</div>
          </li>
        </Link>
        <Link to={`Profile/${user.id}`}>
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
