const generateGreetingMessage = (
  loginUser: string,
  requestedUser: string,
  projectName: string,
) => {
  return `안녕하세요~!! ${loginUser}님! ${requestedUser}님과 함께한 ${projectName}프로젝트에 대해 이야기를 나눠볼 콜라빗 AI예요. 😊 
대화는 5분 정도면 충분할 거예요! 편하게 대화하면서 진행해보면 어떨까요?`;
};
export default generateGreetingMessage;
