interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const sendEmailCodeAPI = async (email: string) => {
  const res = await fetch(`${apiUrl}/auth/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "이메일 전송에 실패했습니다.");
  }

  return data;
};

export const validateEmailCodeAPI = async ({
  email,
  code,
}: {
  email: string;
  code: string;
}) => {
  const res = await fetch(`${apiUrl}/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "인증에 실패했습니다.");
  }

  return data;
};

export const signupAPI = async (body: SignupRequest) => {
  const res = await fetch(`${apiUrl}/auth/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "회원가입에 실패했습니다.");
  }

  return data;
};

export const logoutAPI = async () => {
  const res = await fetch(`${apiUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res;
};

export const loginCredentialAPI = async (body: LoginRequest) => {
  const formData = new URLSearchParams();
  formData.append("email", body.email);
  formData.append("password", body.password);

  const res = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",
    body: formData.toString(), // FormData 대신 URLSearchParams 사용
  });

  if (!res.ok) {
    throw new Error("로그인에 실패했습니다.");
  }

  return res;
};

export const checkNicknameAPI = async (nickname: string) => {
  const res = await fetch(`${apiUrl}/auth/check-nickname`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nickname }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "닉네임 중복 확인에 실패했습니다.");
  }

  return data;
};

export const checkEmailAPI = async (email: string) => {
  const res = await fetch(`${apiUrl}/auth/check-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error("이미 가입된 이메일 입니다.");
  }
  const data = await res.json();

  return data;
};
