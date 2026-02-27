const PageLoad = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white/25">
      <div className="flex flex-col space-y-6 items-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent" />
        <span className="text-center text-gray-700">
          Loading please wait ....
        </span>
      </div>
    </div>
  );
};

export default PageLoad;
