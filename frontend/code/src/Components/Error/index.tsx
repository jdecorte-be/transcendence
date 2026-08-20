import { Font } from "./Assets/Font";

export const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 bg-base-100 h-screen w-screen">
      <Font />
      <h1 className="text-base-content/70 text-2xl sm:text-4xl font-poppins font-semibold tracking-tight">
        Page Not Found
      </h1>
    </div>
  );
};
