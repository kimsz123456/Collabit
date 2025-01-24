import { Button } from "@/shared/ui/button";

const CompareScoreSection = ({ user }: { user: { name: string } }) => {
  return (
    <section className="flex w-full flex-wrap items-center gap-4 border-b-2 border-gray-200 pb-10 sm:flex-nowrap md:px-14">
      <h3 className="sr-only">사용자 평균 협업 점수</h3>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 md:items-start md:gap-8">
        <span className="text-center text-2xl font-bold sm:text-3xl md:text-left">
          안녕하세요,
          <span>{user.name}님!</span>
        </span>
        <span className="text-center text-sm sm:text-left sm:text-base">
          협업했던 팀원들에게 피드백을 받고, <br />
          개발자들의 평균 점수와 나의 점수를 확인해보세요.
        </span>
        <Button className="text-md h-[50px] max-w-[200px] font-semibold">
          피드백 요청하기
        </Button>
      </div>
      <div className="flex h-[300px] w-full items-center justify-center rounded-md bg-gray-200">
        임시 데이터
      </div>
    </section>
  );
};

export default CompareScoreSection;
