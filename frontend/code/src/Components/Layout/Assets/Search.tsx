import {
  useState,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
} from "react";
import { BiSearch, BiX } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../Api/base";
import toast from "react-hot-toast";
import { Spinner, Img } from "../../Loading";
function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const Search = () => {
  const [searchText, setSearchText] = useState("");
  const DebounceValue = useDebounce(searchText.trim());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const onSearchTextChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchText(e.target.value);

  useEffect(() => {
    abortRef.current?.abort();

    if (!DebounceValue) {
      setResult([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const search = async () => {
      try {
        const res = await api.get("/users/search", {
          params: { q: DebounceValue },
          signal: controller.signal,
        });
        setResult(res.data);
        setOpen(true);
      } catch (error: any) {
        if (controller.signal.aborted) return;
        toast.error("can't find anyone");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    search();

    return () => controller.abort();
  }, [DebounceValue]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const clear = () => {
    setOpen(false);
    setSearchText("");
    setResult([]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      searchText ? clear() : e.currentTarget.blur();
      return;
    }
    if (e.key === "Enter" && open && result.length > 0) {
      e.preventDefault();
      const firstResult = result[0];
      clear();
      navigate(`profile/${firstResult.id}`);
    }
  };

  return (
    <div
      ref={containerRef}
      className="dropdown hover:cursor-pointer hidden sm:flex sm:items-center absolute w-80 right-52"
    >
      <input
        tabIndex={0}
        type="text"
        placeholder="Search"
        className={`input w-80 h-8 sm:w-full mr-4 sm:h-12 bg-accent text-neutral border border-base-300 placeholder:text-base-content/40 rounded-xl transition-all duration-200 focus:border-primary/60 focus:scale-[1.01]`}
        onChange={onSearchTextChange}
        onKeyDown={onKeyDown}
        onFocus={() => result.length > 0 && setOpen(true)}
        value={searchText}
      />

      <div className="relative right-14 top-0 w-12 flex items-center">
        {loading ? (
          <Spinner size="sm" className="text-primary" />
        ) : searchText ? (
          <button
            type="button"
            aria-label="Clear search"
            className="hover:text-primary transition-transform duration-150 hover:scale-125 active:scale-90"
            onClick={clear}
          >
            <BiX size="1.6em" />
          </button>
        ) : (
          <BiSearch size="1.4em" />
        )}
      </div>
      <ul
        tabIndex={0}
        className={`dropdown-content z-[9999] menu p-2 shadow bg-base-200 border border-base-300 rounded-box w-full top-12 max-h-96 overflow-y-auto ${
          open ? "animate-scale-in origin-top" : "hidden"
        }`}
      >
        <div className="flex flex-col w-full h-full bg-base-200 z-50">
          {result.length === 0 ? (
            <li className="px-2 py-1.5 text-sm text-base-content/60">
              No users found
            </li>
          ) : (
            result.map((item: any, index: number) => {
              return (
                <Link key={index} to={`profile/${item.id}`} onClick={clear}>
                  <li className="hover:bg-primary/10 hover:rounded-xl hover:translate-x-1 transition-all duration-150 h-full w-full z-[10000]">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="avatar shrink-0">
                        <div className="w-10 rounded-full ring ring-primary ring-offset-base-200 ring-offset-2">
                          <Img alt="" src={item.avatar.thumbnail} className="rounded-full" />
                        </div>
                      </div>
                      <span className="truncate">
                        {item.name.first} {item.name.last}
                      </span>
                    </div>
                  </li>
                </Link>
              );
            })
          )}
        </div>
      </ul>
    </div>
  );
};
