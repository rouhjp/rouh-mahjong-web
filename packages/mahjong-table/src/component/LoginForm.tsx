import { useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  user: any;
  setUser: (user: any) => void;
}

export const LoginForm = ({ user, setUser }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await supabase.auth.signUp({ email, password });
      if (response.error) {
        console.error("サインアップエラー: " + response.error.message);
        setError("サインアップに失敗しました: " + response.error.message);
        return;
      }
      setUser(response.data.user || null);
    } catch (err) {
      console.error("予期せぬエラー:", err);
      setError("予期せぬエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const response = await supabase.auth.signInWithPassword({ email, password });
      if (response.error) {
        console.error("サインインエラー: " + response.error.message);
        setError("ログインに失敗しました: " + response.error.message);
        return;
      }
      console.log("サインイン成功: ", response.data.user);
      setUser(response.data.user || null);
    } catch (err) {
      console.error("予期せぬエラー:", err);
      setError("予期せぬエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("ログアウトエラー:", err);
      setError("ログアウトに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg">
        {user ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">こんにちは, {user.email} さん！</h2>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition duration-300 disabled:opacity-50"
            >
              {loading ? "ログアウト中..." : "ログアウト"}
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">ログイン / 新規登録</h2>
            <div className="space-y-4">
              <form onSubmit={handleSignIn}>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="メールアドレス"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="password"
                    placeholder="パスワード"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex justify-between space-x-2 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300 disabled:opacity-50"
                  >
                    {loading ? "ログイン中..." : "ログイン"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSignUp}
                    disabled={loading}
                    className="w-1/2 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-300 disabled:opacity-50"
                  >
                    {loading ? "登録中..." : "新規登録"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
