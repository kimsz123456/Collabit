const CommunityLayout = async ({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) => {
  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center py-5 md:py-10">
        {children}
        {modal}
      </div>
    </>
  );
};

export default CommunityLayout;
