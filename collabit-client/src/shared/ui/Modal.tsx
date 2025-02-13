"use client";
const Modal = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6">
        {children}
      </div>
    </div>
  );
};

export default Modal;
