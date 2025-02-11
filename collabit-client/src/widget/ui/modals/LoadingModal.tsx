import Image from "next/image";

const LoadingModal = ({ context }: { context: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 어두운 오버레이 배경 */}
      <div className="absolute inset-0 bg-black/50" />

      {/* 로딩 컨텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center rounded-lg">
        <Image
          src={"/images/logo-lg.png"}
          alt="loading"
          width={100}
          height={100}
          className="animate-custom-pulse"
        />
        <span className="mt-4 flex text-2xl font-bold text-gray-300">
          <p className="relative">{context}</p>
        </span>
      </div>
    </div>
  );
};
export default LoadingModal;
