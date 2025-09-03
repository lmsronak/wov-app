import { LoginForm } from "@/components/login-form";
import { useState } from "react";
import { useSetAtom } from "jotai";
import axios from "axios";
import { userInfoWithPersistenceAtom } from "@/atoms/user";
import { useNavigate } from "react-router";

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  mfaRequired: boolean;
  mfaEnabled: boolean;
  qrCodeDataUrl?: string;
}

// export default function LoginScreen() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [mfaStage, setMfaStage] = useState<"none" | "setup" | "login">("none");
//   const [qrCode, setQrCode] = useState("");
//   const [mfaToken, setMfaToken] = useState("");

//   const navigate = useNavigate();
//   const setUser = useSetAtom(userInfoWithPersistenceAtom);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       // const res = await axios.post("/api/users/login", { email, password });
//       // const user = res.data;

//       // setUser(user); // persists to localStorage as well

//       // if (user.isAdmin) {
//       //   navigate("/admin/userlist");
//       // } else {
//       //   navigate("/clients");
//       // }

//       const res = await axios.post<AuthResponse>("/api/users/login", {
//         email,
//         password,
//       });
//       const data = res.data;

//       if (data.mfaRequired) {
//         setQrCode(data.qrCodeDataUrl || "");
//         setMfaStage("setup");
//       } else if (data.requiresMfaLogin) {
//         setMfaStage("login");
//       } else {
//         setUser(data.user);
//         navigate(data.user.isAdmin ? "/admin/userlist" : "/clients");
//       }
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMfaVerify = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const endpoint =
//         mfaStage === "setup"
//           ? "/api/users/mfa-setup-verify"
//           : "/api/users/mfa-verify";

//       const res = await axios.post(endpoint, { email, token: mfaToken });

//       const user = res.data.user;
//       setUser(user);
//       navigate("/admin/userlist");
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Invalid MFA token");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
//       <div className="w-full max-w-sm">
//         {/* <LoginForm
//           email={email}
//           password={password}
//           setEmail={setEmail}
//           setPassword={setPassword}
//           handleSubmit={handleSubmit}
//           loading={loading}
//           error={error}
//         /> */}
//         {mfaStage === "none" ? (
//           <LoginForm
//             email={email}
//             password={password}
//             setEmail={setEmail}
//             setPassword={setPassword}
//             handleSubmit={handleSubmit}
//             loading={loading}
//             error={error}
//           />
//         ) : (
//           <form onSubmit={handleMfaVerify} className="space-y-4">
//             {mfaStage === "setup" && (
//               <>
//                 <h2 className="text-lg font-semibold">
//                   Scan this QR code in your Authenticator app
//                 </h2>
//                 <img src={qrCode} alt="MFA QR Code" />
//               </>
//             )}

//             <input
//               type="text"
//               value={mfaToken}
//               onChange={(e) => setMfaToken(e.target.value)}
//               placeholder="Enter 6-digit MFA code"
//               className="w-full border px-3 py-2 rounded"
//               inputMode="numeric"
//             />
//             {error && <p className="text-red-500">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white p-2 rounded"
//             >
//               {loading ? "Verifying..." : "Verify MFA"}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mfaStage, setMfaStage] = useState<"none" | "setup" | "login">("none");
  const [qrCode, setQrCode] = useState("");
  const [mfaToken, setMfaToken] = useState("");

  const navigate = useNavigate();
  const setUser = useSetAtom(userInfoWithPersistenceAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/users/login", { email, password });
      const response = res.data;

      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      const result = response.data;

      if (result.mfaRequired) {
        if (result.mfaStage === "setup") {
          setQrCode(result.qrCodeDataUrl || "");
          setMfaStage("setup");
        } else if (result.mfaStage === "login") {
          setMfaStage("login");
        }
      } else {
        setUser(result);
        navigate(result.isAdmin ? "/admin/userlist" : "/clients");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        mfaStage === "setup"
          ? "/api/users/mfa-setup-verify"
          : "/api/users/mfa-verify";

      const res = await axios.post(endpoint, {
        email,
        token: mfaToken,
        password,
      });
      const response = res.data;

      if (!response.success) {
        console.log(response);
        throw new Error(response.message || "Invalid MFA code");
      }

      const user = response.data;
      // console.log("user on mfa verify: ", user);
      setUser(user);
      navigate("/admin/userlist");
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Invalid MFA token"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {mfaStage === "none" ? (
          <LoginForm
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        ) : (
          <form onSubmit={handleMfaVerify} className="space-y-4">
            {mfaStage === "setup" && (
              <>
                <h2 className="text-lg font-semibold">
                  Scan this QR code in your Authenticator app
                </h2>
                <img src={qrCode} alt="MFA QR Code" />
              </>
            )}
            <input
              type="text"
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              placeholder="Enter 6-digit MFA code"
              className="w-full border px-3 py-2 rounded"
              inputMode="numeric"
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded"
            >
              {loading ? "Verifying..." : "Verify MFA"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
