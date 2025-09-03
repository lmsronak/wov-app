import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router";
import { useAtomValue } from "jotai";
import { userInfoAtom } from "@/atoms/user";
import { Button } from "@/components/ui/button";
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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UserEditScreen from "./UserEditScreen";
import { Table } from "antd";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  status: string;
}

const fetchUsers = async () => {
  const { data } = await axios.get("/api/users/admin");
  return data.users;
};

const AllUserScreen = () => {
  const userInfo = useAtomValue(userInfoAtom);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const updateButtonRef = useRef<HTMLButtonElement>(null);

  // const [users, setUsers] = useState<User[]>([]);

  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingDelete, setLoadingDelete] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: users,
    isLoading,
    isError,
    error: FetchError,
  } = useQuery({
    queryKey: ["adminUsers"], // unique key for caching
    queryFn: fetchUsers,
  });

  useEffect(() => {
    if (isError) {
      setError(FetchError.message);
    }
  }, [isError, FetchError]);

  const handleDelete = async (id: string) => {
    try {
      setLoadingDelete(true);
      await axios.delete(`/api/users/${id}`);
      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
      toast.success("User deleted successfully");
      // setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setLoadingDelete(false);
    }
  };

  const updateStatus = async (userId: string, newStatus: string) => {
    try {
      // setUsers((prev) =>
      //   prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
      // );
      await axios.patch(`/api/users/${userId}`, { status: newStatus });
      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  // const columns = [
  //   {
  //     title: "ID",
  //     dataIndex: "_id",
  //     key: "_id",
  //     // className:
  //     // "whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0",
  //   },
  //   {
  //     title: "Name",
  //     dataIndex: "name",
  //     key: "name",
  //     // className: "whitespace-nowrap px-3 py-4 text-sm text-gray-700",
  //   },
  //   {
  //     title: "Email",
  //     dataIndex: "email",
  //     key: "email",
  //     // className:
  //     // "whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800",
  //   },
  //   {
  //     title: "Admin",
  //     dataIndex: "isAdmin",
  //     key: "isAdmin",
  //     render: (isAdmin: boolean) =>
  //       isAdmin ? <CheckCircleIcon className="h-5 w-5 text-green-600" /> : null,
  //     // className: "whitespace-nowrap px-3 py-4 text-sm text-gray-700",
  //   },
  //   {
  //     title: "Actions",
  //     key: "actions",
  //     render: (_: any, record: any) => (
  //       <>
  //         <Dialog>
  //           <DialogTrigger>
  //             <Button ref={updateButtonRef} variant={"outline"}>
  //               Edit
  //             </Button>
  //           </DialogTrigger>
  //           <DialogContent>
  //             <UserEditScreen
  //               buttonRef={updateButtonRef}
  //               type="update"
  //               userId={record._id}
  //             />
  //           </DialogContent>
  //         </Dialog>

  //         <AlertDialog>
  //           <AlertDialogTrigger asChild>
  //             <Button
  //               disabled={
  //                 (userInfo && userInfo._id === record._id) || loadingDelete
  //               }
  //               className="ml-3 inline-flex items-center rounded bg-red-100 px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-200"
  //             >
  //               {loadingDelete ? "Deleting" : "Delete"}
  //             </Button>
  //           </AlertDialogTrigger>
  //           <AlertDialogContent>
  //             <AlertDialogHeader>
  //               <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
  //               <AlertDialogDescription>
  //                 This action cannot be undone. This will permanently delete
  //                 your account and remove your data from our servers.
  //               </AlertDialogDescription>
  //             </AlertDialogHeader>
  //             <AlertDialogFooter>
  //               <AlertDialogCancel>Cancel</AlertDialogCancel>
  //               <AlertDialogAction onClick={() => handleDelete(record._id)}>
  //                 Continue
  //               </AlertDialogAction>
  //             </AlertDialogFooter>
  //           </AlertDialogContent>
  //         </AlertDialog>
  //       </>
  //     ),
  //     // className: "whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0",
  //   },
  //   {
  //     title: "Status",
  //     key: "status",
  //     render: (_: any, record: any) => (
  //       <select
  //         value={record.status}
  //         onChange={(e) => updateStatus(record._id, e.target.value)}
  //         className={`
  //           rounded px-2 py-1 font-semibold text-sm
  //           ${record.status === "approved" ? "bg-green-100 text-green-700" : ""}
  //           ${
  //             record.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""
  //           }
  //           ${record.status === "rejected" ? "bg-red-100 text-red-700" : ""}
  //         `}
  //       >
  //         <option value="pending">Pending</option>
  //         <option value="approved">Approved</option>
  //         <option value="rejected">Rejected</option>
  //       </select>
  //     ),
  //     // className: "whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0",
  //   },
  // ];

  return (
    <div className="bg-white">
      <div className=" px-4 pb-24 pt-16 sm:px-6  lg:px-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            All Users
          </h1>

          <Dialog>
            <DialogTrigger>
              <Button
                // onClick={() => {
                //   navigate("/register");
                // }}
                ref={createButtonRef}
              >
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <UserEditScreen type="create" />
            </DialogContent>
          </Dialog>
        </div>

        {/* {isLoading ? (
          <p className="mt-6">Loading...</p>
        ) : error ? (
          <div className="mt-6 text-red-600">{error}</div>
        ) : (
          <div className="mt-8 flow-root">
            <div className="-mx-4 bg-yellow-100 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block w-full max-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y table-auto divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Sr
                      </th>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        ID
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
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Plan
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Price
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Pl Start
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Pl End
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Pl Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Admin
                      </th>
                      <th className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0">
                        Actions
                      </th>
                      <th className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0">
                        Acc Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {users.map((user: any, idx: number) => (
                      <tr key={user._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">
                          {idx + 1}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">
                          {user._id}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {user.name}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.email}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.phone}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.subscription.plan?.name ?? "Free Plan"}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.subscription.plan?.priceInRupees
                            ? `${user.subscription.plan?.priceInRupees}/-`
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.subscription.startDate
                            ? format(user.subscription.startDate, "dd/MM/yyyy")
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.subscription.endDate
                            ? format(user.subscription.endDate, "dd/MM/yyyy")
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap capitalize px-3 py-4 text-sm font-medium text-gray-800">
                          {user.subscription.status ?? "-"}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {user.isAdmin && (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          )}
                        </td>

                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
                          <Dialog>
                            <DialogTrigger>
                              <Button ref={updateButtonRef} variant={"outline"}>
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <UserEditScreen type="update" userId={user._id} />
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                disabled={
                                  (userInfo && userInfo._id === user._id) ||
                                  loadingDelete
                                }
                                className="ml-3 inline-flex items-center rounded bg-red-100 px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-200"
                              >
                                {loadingDelete ? "Deleting" : "Delete"}
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
                                  onClick={() => handleDelete(user._id)}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>

                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
                          <select
                            value={user.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;

                              // setUsers((prevUsers) =>
                              //   prevUsers.map((u) =>
                              //     u._id === user._id
                              //       ? { ...u, status: newStatus }
                              //       : u
                              //   )
                              // );

                              axios
                                .patch(`/api/users/${user._id}`, {
                                  status: newStatus,
                                })
                                .then(() => {
                                  queryClient.invalidateQueries({
                                    queryKey: ["adminUsers"],
                                  });
                                  toast.success("Status updated");
                                })
                                .catch((err) =>
                                  toast.error(
                                    err?.response?.data?.message || err.message
                                  )
                                );
                            }}
                            className={`
                              rounded px-2 py-1 font-semibold text-sm
                              ${
                                user.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : ""
                              }
                              ${
                                user.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : ""
                              }
                              ${
                                user.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : ""
                              }
                            `}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )} */}
        {isLoading ? (
          <p className="mt-6">Loading...</p>
        ) : error ? (
          <div className="mt-6 text-red-600">{error}</div>
        ) : (
          <div className="mt-8 flow-root">
            {/* ✅ scrollable container */}
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300 table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Sr
                      </th>
                      <th className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                        ID
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
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Plan
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Price
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Pl Start
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Pl End
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Pl Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Admin
                      </th>
                      <th className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0">
                        Actions
                      </th>
                      <th className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0">
                        Acc Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {users.map((user: any, idx: number) => (
                      <tr key={user._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">
                          {idx + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {user._id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {user.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.phone}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.subscription.plan?.name ?? "Free Plan"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.subscription.plan?.priceInRupees
                            ? `${user.subscription.plan?.priceInRupees}/-`
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.subscription.startDate
                            ? format(user.subscription.startDate, "dd/MM/yyyy")
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800">
                          {user.subscription.endDate
                            ? format(user.subscription.endDate, "dd/MM/yyyy")
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap capitalize px-3 py-4 text-sm font-medium text-gray-800">
                          {user.subscription.status ?? "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {user.isAdmin && (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          )}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
                          <Dialog>
                            <DialogTrigger>
                              <Button ref={updateButtonRef} variant={"outline"}>
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <UserEditScreen type="update" userId={user._id} />
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                disabled={
                                  (userInfo && userInfo._id === user._id) ||
                                  loadingDelete
                                }
                                className="ml-3 inline-flex items-center rounded bg-red-100 px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-200"
                              >
                                {loadingDelete ? "Deleting" : "Delete"}
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
                                  onClick={() => handleDelete(user._id)}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
                          <select
                            value={user.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              axios
                                .patch(`/api/users/${user._id}`, {
                                  status: newStatus,
                                })
                                .then(() => {
                                  queryClient.invalidateQueries({
                                    queryKey: ["adminUsers"],
                                  });
                                  toast.success("Status updated");
                                })
                                .catch((err) =>
                                  toast.error(
                                    err?.response?.data?.message || err.message
                                  )
                                );
                            }}
                            className={`
                      rounded px-2 py-1 font-semibold text-sm
                      ${
                        user.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : ""
                      }
                      ${
                        user.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : ""
                      }
                      ${
                        user.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : ""
                      }
                    `}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
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

export default AllUserScreen;
