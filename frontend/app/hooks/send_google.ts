// TODO: 後ほど削除予定

// PKCEのコードチャレンジを生成する関数
const generateCodeChallenge = (codeVerifier: string) => {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
    .then(buffer => {
      const hash = Array.from(new Uint8Array(buffer))
        .map(b => ('00' + b.toString(16)).slice(-2))
        .join('');
      return btoa(hash);
    });
};

// 認可コードフローのリクエストを送信
export const redirectToCognito = async () => {
  const codeVerifier = crypto.randomUUID();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // return`${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&response_type=code&scope=openid+email+profile&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${process.env.NEXT_PUBLIC_STATE}`;
  return`${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&identity_provider=Google&response_type=code&scope=openid+email+profile&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&state=${process.env.NEXT_PUBLIC_STATE}`;
};
