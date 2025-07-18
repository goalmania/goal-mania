import { Spinner } from "../ui/spinner";

export const LoadingFallback = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <Spinner show={true} size="medium" />
    </div>
  );
};