import { Spinner } from "../ui/spinner";

export const LoadingFallback = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
      <Spinner show={true} size="medium" />
    </div>
  );
};