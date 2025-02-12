interface ShareLayoutProps {
  params: Promise<{ user: string }>;
  children: React.ReactNode;
}

const ShareLayout = ({ children }: ShareLayoutProps) => {
  return <div>{children}</div>;
};

export default ShareLayout;
