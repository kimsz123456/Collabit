const ReportTitle = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <div>
      <h2 className="mb-2 bg-violet-50 text-2xl font-semibold text-gray-700">
        {`# ${title}`}
      </h2>
      {description && (
        <p className="mb-2 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
};
export default ReportTitle;
