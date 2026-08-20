import {
  useState,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
} from "react";
import { BiSearch, BiX, BiLoaderAlt } from "react-icons/bi";
import { Link } from "react-router-dom";
import api from "../../../Api/base";
import toast from "react-hot-toast";
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
    if (e.key !== "Escape") return;
    e.stopPropagation();
    searchText ? clear() : e.currentTarget.blur();
  };

  return (
    <div
      ref={containerRef}
      className="dropdown hover:cursor-pointer hidden  sm:flex sm:items-center absolute w-80 right-52"
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
          <BiLoaderAlt size="1.4em" className="animate-spin" />
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
        className={`dropdown-content z-[9999] menu p-2 shadow bg-base-200 border border-base-300 rounded-box w-full top-12 ${
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
                <Link key={index} to={`Profile/${item.id}`} onClick={clear}>
                  <li className="hover:bg-primary/10 hover:rounded-xl hover:translate-x-1 transition-all duration-150 h-full w-full z-[10000]">
                    <div className="flex items-center gap-2">
                      <div className="avatar">
                        <div className="w-auto rounded-full gap-4 ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img alt="" src={item.avatar.thumbnail} />
                        </div>
                      </div>
                      <span>
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
