"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import GradientText from "./ui/gradient-text";
import Link from "next/link";
import { auth, db, googleProvider } from "@/firebase.config";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { generateRandomPlaceholderUsername } from "@/lib/utils";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isLoadingButtonRegister, setIsLoadingButtonRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingButtonRegister(true);
    signUp(email, password);
  };

  const signUp = async (email: string, password: string) => {
    try {
      const registredUser = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", registredUser.user.uid), {
        email: registredUser.user.email,
        createdAt: new Date().toISOString(),
        uid: registredUser.user.uid,
        userRole: 1,
        userName: generateRandomPlaceholderUsername(),
      });

      router.push("/initialpage");
    } catch (err) {
      setError(true);
      if (err instanceof FirebaseError) {
        const errorMessage = err.message;
        const errorCode = err.code;

        switch (errorCode) {
          case "auth/weak-password":
            setErrorMessage("The password is too weak.");
            break;
          case "auth/email-already-in-use":
            setErrorMessage("This email address is already in use by another account.");
          case "auth/invalid-email":
            setErrorMessage("This email address is invalid.");
            break;
          case "auth/operation-not-allowed":
            setErrorMessage("Email/password accounts are not enabled.");
            break;
          default:
            setErrorMessage(errorMessage);
            break;
        }
      }
    } finally {
      setIsLoadingButtonRegister(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);

      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          createdAt: new Date().toISOString(),
          uid: userCredential.user.uid,
          userRole: 1,
          userName: generateRandomPlaceholderUsername(),
        });
      }

      router.push("/initialpage");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-96 max-w-md p-8 space-y-6">
      <GradientText className="text-3xl text-center">Comece a sua jornada</GradientText>
      <form onSubmit={handleSubmit} className="w-full   space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-700 text-white placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Senha
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-gray-700 text-white placeholder-gray-400"
          />
        </div>
        <div className="flex items-center">
          <Checkbox
            id="accept-terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            className="border-gray-400"
            required
          />
          <label htmlFor="accept-terms" className="ml-2 text-sm text-gray-300">
            Ao criar uma conta, você concorda com nossos Termos de Serviço e Política de Privacidade
          </label>
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          loading={isLoadingButtonRegister}
          loadingText="Cadastrando..."
        >
          Cadastrar-se
        </Button>
        {error && <p className="ml-2 text-sm text-[#aa0000]">{errorMessage}</p>}
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-zinc-800 text-gray-400">ou</span>
        </div>
      </div>
      <Button variant="secondary" className="w-full" onClick={signInWithGoogle}>
        <svg className="w-5 h-5 mr-2" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_13183_10121)">
            <path
              d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z"
              fill="#3F83F8"
            />
            <path
              d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z"
              fill="#34A853"
            />
            <path
              d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z"
              fill="#FBBC04"
            />
            <path
              d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z"
              fill="#EA4335"
            />
          </g>
          <defs>
            <clipPath id="clip0_13183_10121">
              <rect width="20" height="20" fill="white" transform="translate(0.5)" />
            </clipPath>
          </defs>
        </svg>
        Cadastrar com Google
      </Button>
      <p className="text-center text-sm text-gray-400">
        Já possui uma conta?{" "}
        <Link href="/login" className="text-blue-500 hover:underline">
          Entre Agora
        </Link>
      </p>
    </div>
  );
}
