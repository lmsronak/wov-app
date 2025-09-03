import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "./ClientListScreen";
import { useEffect, useRef, type RefObject } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";

type CreateClientFormProps = {
  name: string;
  phone: number | "";
  email: string;
  loading: boolean;
  error: string;
  setName: (value: string) => void;
  setPhone: (value: number | "") => void;
  setEmail: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  dialogRef: RefObject<HTMLButtonElement | null>;
  type?: "update" | "create";
  client?: User;
};

export function CreateForm({
  name,
  email,
  phone,
  setName,
  setEmail,
  setPhone,
  handleSubmit,
  type,
  client,
  dialogRef,
}: CreateClientFormProps) {
  if (type === "update") {
    useEffect(() => {
      setName(client?.name ?? "");
      setEmail(client?.email ?? "");
      setPhone(client?.phone ?? "");
    }, []);
  }

  const queryClient = useQueryClient();

  const { mutate: updateClient } = useMutation({
    mutationFn: async (updated: {
      name: string;
      phone: number;
      email: string;
      clientId: string;
    }) => {
      return axios.put("/api/clients/", {
        ...updated,
        // roles: ["client"],
      });
    },
    onSuccess() {
      toast.success("Client Details updated");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setName("");
      setEmail("");
      setPhone("");
      dialogRef.current?.click();
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    if (!client) {
      throw new Error("client id is required to update");
    }
    e.preventDefault();
    if (!name || !phone || !email) {
      toast.error("Please Fill all the details");
      return;
    }
    updateClient({ name, phone, email, clientId: client._id });
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setName("");
          setEmail("");
          setPhone("");
          setEmail("");
        } else {
          if (type === "update") {
            setName(client?.name ?? "");
            setEmail(client?.email ?? "");
            setPhone(client?.phone ?? "");
            setEmail(client?.email ?? "");
          } else {
            setName("");
            setEmail("");
            setPhone("");
            setEmail("");
          }
        }
      }}
    >
      <form>
        <DialogTrigger asChild>
          <Button
            // ref={dialogRef}
            // className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            variant={type === "update" ? "outline" : "default"}
          >
            {type === "update" ? "Edit" : "Create Client"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Client profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="number"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setPhone("");
                  } else {
                    // if (e.target.value.length <= 10) {
                    setPhone(+e.target.value);
                    // }
                  }
                }}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button ref={dialogRef} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={type === "update" ? handleUpdate : handleSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
