type RandomUserButtonProps = {
  loading: boolean;
  onClick: () => void;
};

export const RandomUserButton = ({ loading, onClick }: RandomUserButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group flex items-center justify-center gap-3 w-[330px] h-[81px] rounded-2xl bg-base-300 text-neutral border border-secondary transition duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary ease-in-out disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`h-6 w-6 text-primary transition-transform duration-500 ${
          loading ? "animate-spin" : "group-hover:rotate-90"
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {loading ? (
          <>
            <path d="M21 12a9 9 0 1 1-9-9" />
          </>
        ) : (
          <>
            <path d="M16 3h5v5" />
            <path d="M4 20 21 3" />
            <path d="M21 16v5h-5" />
            <path d="M15 15l6 6" />
            <path d="M4 4l5 5" />
          </>
        )}
      </svg>
      <span className="font-semibold">
        {loading ? "Logging in..." : "Login as random user"}
      </span>
    </button>
  );
};
