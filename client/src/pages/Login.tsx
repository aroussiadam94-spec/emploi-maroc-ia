import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import BrandLogo from "@/components/BrandLogo";
import { getGoogleAuthUrl, getGithubAuthUrl, getExternalAuthUrl, getMockAuthUrl } from "@/const";
import { Mail, Lock, User, Github } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, refresh } = useAuth({ redirectOnUnauthenticated: false });

  const googleUrl = getGoogleAuthUrl();
  const githubUrl = getGithubAuthUrl();
  const externalUrl = getExternalAuthUrl();
  const mockUrl = getMockAuthUrl();

  const schema = isLogin ? loginSchema : registerSchema;
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", name: "" },
  });

  const loginMutation = trpc.auth.loginLocal.useMutation({
    onSuccess: async () => {
      await refresh();
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error("Erreur de connexion", { description: error.message });
    },
  });

  const registerMutation = trpc.auth.registerLocal.useMutation({
    onSuccess: async () => {
      await refresh();
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error("Erreur d'inscription", { description: error.message });
    },
  });

  const onSubmit = (data: any) => {
    if (isLogin) {
      loginMutation.mutate({ email: data.email, password: data.password });
    } else {
      registerMutation.mutate({ email: data.email, password: data.password, name: data.name });
    }
  };

  // Redirect if already logged in
  if (user) {
    window.location.href = "/dashboard";
    return null;
  }

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <BrandLogo className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Bon retour" : "Créer un compte"}
          </h1>
          <p className="text-sm text-gray-500">
            {isLogin ? "Connectez-vous pour accéder à votre espace" : "Rejoignez-nous pour propulser votre carrière"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nom complet</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("name")}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow sm:text-sm"
                  placeholder="Adam Aroussi"
                />
              </div>
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message as string}</p>}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register("email")}
                type="email"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow sm:text-sm"
                placeholder="vous@exemple.com"
              />
            </div>
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message as string}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register("password")}
                type="password"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message as string}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Veuillez patienter..." : (isLogin ? "Se connecter" : "S'inscrire")}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            {externalUrl ? (
              <a
                href={externalUrl}
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Portail de connexion
              </a>
            ) : (
              <>
                {googleUrl && (
                  <a
                    href={googleUrl}
                    className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </a>
                )}
                {!googleUrl && !githubUrl && !externalUrl && mockUrl && (
                  <a
                    href={mockUrl}
                    className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Développement (Mock)
                  </a>
                )}
              </>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          {isLogin ? "Vous n'avez pas de compte ? " : "Vous avez déjà un compte ? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
          >
            {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
          </button>
        </p>
      </div>
    </div>
  );
}
