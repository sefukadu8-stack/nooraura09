import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

export default function Login() {

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      alert("Login Success ✅");
      console.log(result.user);
    } catch (err) {
      alert("Error ❌");
      console.log(err);
    }
  };

  return (
    <button onClick={handleLogin}>
      Login with Google
    </button>
  );
}
