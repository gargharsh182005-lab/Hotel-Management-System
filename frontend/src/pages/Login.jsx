
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, ShieldCheck, Sparkles } from "lucide-react";
import API from "../api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await API.post("/api/auth/login", form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(location.state?.from || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[1.05fr_.95fr]">
        <aside
          className="relative hidden min-h-[680px] flex-col justify-between bg-cover bg-center p-10 text-white lg:flex"
          style={{ backgroundImage: "linear-gradient(180deg,rgba(33,29,25,.15),rgba(33,29,25,.82)),url('https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=85')" }}
        >
          <Link to="/" className="relative z-10 inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white">
            <ArrowLeft size={17} /> Back to StaySmart
          </Link>
          <div className="relative z-10 max-w-md">
            <Sparkles className="mb-5 text-orange-300" size={26} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200">Your next chapter awaits</p>
            <h2 className="mt-3 text-5xl font-bold leading-tight">A little closer to somewhere lovely.</h2>
            <p className="mt-5 leading-7 text-white/80">Sign in to find your reservations and plan a stay worth remembering.</p>
          </div>
          <p className="relative z-10 text-xs text-white/60">Thoughtful stays, beautifully found.</p>
        </aside>

        <div className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <Link to="/" className="text-2xl font-bold tracking-tight text-indigo-700">
              StaySmart<span className="text-orange-500">.</span>
            </Link>
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Welcome back</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Sign in to your account</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">Your next great stay is just around the corner.</p>

            {(error || location.state?.message) && (
              <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error || location.state.message}
              </p>
            )}

            <div className="mt-8 space-y-5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="login-email">
                Email address
                <span className="relative mt-2 block">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 py-3.5 pl-10 pr-4 text-sm font-normal outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-700" htmlFor="login-password">
                Password
                <span className="relative mt-2 block">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 py-3.5 pl-10 pr-4 text-sm font-normal outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </span>
              </label>

              <button disabled={submitting} className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-700 p-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/15 transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? "Signing you in..." : "Sign in"}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              New to StaySmart?{" "}
              <Link to="/signup" className="font-bold text-indigo-700 hover:text-indigo-900">Create an account</Link>
            </p>
            <p className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} /> Your details are protected and secure
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
