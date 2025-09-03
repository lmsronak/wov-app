// import { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { Link } from "react-router";
// import { CreateForm } from "./CreateForm";
// import { setCurrentClientAtom } from "./clientAtom";
// import { useSetAtom } from "jotai";
// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   isAdmin: boolean;
//   status: string;
// }

// const fetchClients = async () => {
//   const { data } = await axios.get("/api/clients");
//   return data.clients as User[];
// };

// const createClient = async (newClient: {
//   name: string;
//   phone: string;
//   email: string;
// }) => {
//   return axios.post("/api/clients/", {
//     ...newClient,
//     roles: ["client"],
//   });
// };

// const deleteClient = async (id: string) => {
//   return axios.delete(`/api/users/${id}`);
// };

// const ClientListScreen = () => {
//   const [clients, setClients] = useState<User[]>([]);
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [loadingDelete, setLoadingDelete] = useState(false);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         setLoading(true);
//         const { data } = await axios.get("/api/clients");
//         setClients(data.clients);
//       } catch (err: any) {
//         setError(err?.response?.data?.message || err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const handleDelete = async (id: string) => {
//     if (window.confirm("Are you sure you want to delete this user?")) {
//       try {
//         setLoadingDelete(true);
//         await axios.delete(`/api/users/${id}`);
//         toast.success("User deleted successfully");
//         setClients((prev) => prev.filter((client) => client._id !== id));
//       } catch (err: any) {
//         toast.error(err?.response?.data?.message || err.message);
//       } finally {
//         setLoadingDelete(false);
//       }
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     if (!name || !phone || !email) {
//       throw new Error("All client details are required");
//     }
//     try {
//       await axios.post("/api/clients/", {
//         name,
//         phone,
//         email,
//         roles: ["client"],
//       });

//       setName("");
//       setPhone("");
//       setEmail("");
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Register failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setCurrentClient = useSetAtom(setCurrentClientAtom);

//   useEffect(() => {
//     setCurrentClient(undefined);
//   }, []);

//   return (
//     <div className="bg-white">
//       <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
//         <div className="flex justify-between">
//           <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
//             Select or Create Client
//           </h1>

//           <CreateForm
//             name={name}
//             phone={phone}
//             email={email}
//             setName={setName}
//             setPhone={setPhone}
//             setEmail={setEmail}
//             handleSubmit={handleSubmit}
//             loading={loading}
//             error={error}
//           />
//         </div>

//         {loading ? (
//           <p className="mt-6">Loading...</p>
//         ) : error ? (
//           <div className="mt-6 text-red-600">{error}</div>
//         ) : (
//           <div className="mt-8 flow-root">
//             <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
//               <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
//                 <table className="min-w-full divide-y divide-gray-300">
//                   <thead>
//                     <tr>
//                       <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
//                         ID
//                       </th>
//                       <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
//                         Name
//                       </th>
//                       <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
//                         Email
//                       </th>
//                       <th className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0">
//                         Actions
//                       </th>
//                       <th className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0"></th>
//                     </tr>
//                   </thead>

//                   <tbody className="divide-y divide-gray-200">
//                     {clients.map((client: User) => (
//                       <tr key={client._id}>
//                         <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">
//                           {client._id}
//                         </td>

//                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
//                           {client.name}
//                         </td>

//                         <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
//                           {client.email}
//                         </td>

//                         <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
//                           <Link
//                             to={`/admin/user/${client._id}/edit`}
//                             className="text-indigo-600 hover:text-indigo-900"
//                           >
//                             Edit
//                           </Link>

//                           <button
//                             onClick={() => handleDelete(client._id)}
//                             disabled={loadingDelete}
//                             className="ml-3 inline-flex items-center rounded bg-red-100 px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-200"
//                           >
//                             {loadingDelete ? "Deleting" : "Delete"}
//                           </button>
//                         </td>

//                         <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
//                           <Link
//                             to={`/clients/${client._id}`}
//                             onClick={() => setCurrentClient(client._id)}
//                             className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                           >
//                             Select
//                           </Link>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ClientListScreen;

import { useRef, useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { useSetAtom } from "jotai";

import { CreateForm } from "./CreateForm"; // assuming you have this
import { setCurrentClientAtom } from "./clientAtom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  status: string;
  phone?: number;
}

const fetchClients = async () => {
  const { data } = await axios.get("/api/clients");
  return data.clients as User[];
};

const createClient = async (newClient: {
  name: string;
  phone: number;
  email: string;
}) => {
  return axios.post("/api/clients/", {
    ...newClient,
    roles: ["client"],
  });
};

const deleteClient = async (id: string) => {
  return axios.delete(`/api/users/${id}`);
};

const ClientListScreen = () => {
  const queryClient = useQueryClient();
  const dialogRef = useRef<HTMLButtonElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("" as number | "");
  const [email, setEmail] = useState("");

  const setCurrentClient = useSetAtom(setCurrentClientAtom);

  // Fetch clients
  const {
    data: clients = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Client created successfully");
      setName("");
      setPhone("");
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      dialogRef.current?.click();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Register failed");
    },
  });

  // Delete client mutation
  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      toast.error("All client details are required");
      return;
    }

    createMutation.mutate({ name, phone, email });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="bg-white">
      <div className="mx-auto px-4 pb-24 pt-16 sm:px-6  lg:px-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Select or Create Client
          </h1>

          <CreateForm
            name={name}
            phone={phone}
            email={email}
            dialogRef={dialogRef}
            setName={setName}
            setPhone={setPhone}
            setEmail={setEmail}
            handleSubmit={handleSubmit}
            loading={createMutation.isPending}
            error={
              createMutation.isError
                ? (createMutation.error as any)?.message
                : ""
            }
          />
        </div>

        {isLoading ? (
          <p className="mt-6">Loading...</p>
        ) : isError ? (
          <div className="mt-6 text-red-600">
            {(error as any)?.response?.data?.message ??
              ((error as any)?.message || "Failed to load clients")}
          </div>
        ) : (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Sr
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Phone
                      </th>
                      <th className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0">
                        Actions
                      </th>
                      <th className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0"></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {clients.map((client, idx) => (
                      <tr key={client._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">
                          {idx + 1}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {client.name}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {client.email}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {client.phone}
                        </td>

                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm flex justify-end sm:pr-0">
                          <CreateForm
                            name={name}
                            phone={phone}
                            email={email}
                            setName={setName}
                            setPhone={setPhone}
                            dialogRef={dialogRef}
                            setEmail={setEmail}
                            handleSubmit={handleSubmit}
                            loading={createMutation.isPending}
                            error={
                              createMutation.isError
                                ? (createMutation.error as any)?.message
                                : ""
                            }
                            type="update"
                            client={client}
                          />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                disabled={deleteMutation.isPending}
                                className="ml-3 inline-flex items-center rounded bg-red-100 px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-200"
                              >
                                {deleteMutation.isPending
                                  ? "Deleting"
                                  : "Delete"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete your account and remove
                                  your data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(client._id)}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>

                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
                          <Link
                            to={`/clients/${client._id}`}
                            onClick={() => setCurrentClient(client._id)}
                            className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            Select
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientListScreen;
