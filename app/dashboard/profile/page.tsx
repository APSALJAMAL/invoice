/* eslint-disable react/jsx-no-undef */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BadgeCheck, ShieldX } from "lucide-react";
import Image from "next/image";

interface User {
  name: string | null;
  email: string;
  address: string | null;
  image: string | null;
  role: string;
}

interface Details {
  key: string;
  secret: string;
  organizationId: string;
  organizationName: string;
  organizationAddress: string;
  gstNumber: string;
  verified: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    address: "",
    image: "",
    role: "",
  });
  const [details, setDetails] = useState<Details>({
    key: "",
    secret: "",
    organizationId: "",
    organizationName: "",
    organizationAddress: "",
    gstNumber: "",
    verified: false,
  });

  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, detailsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/details/me"),
        ]);
        const userData = await userRes.json();
        const detailsData = await detailsRes.json();
        console.log("userdata", userData);

        if (userRes.ok) setUser(userData);
        else toast.error(userData.error || "Failed to load user");

        if (detailsRes.ok) setDetails(detailsData);
        else toast.error(detailsData.error || "Failed to load details");
      } catch (err) {
        console.error(err);
        toast.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails({
      ...details,
      [name]: value,
    });
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (res.ok) toast.success("Profile updated!");
      else toast.error(data.error || "Failed to update profile");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSavingUser(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      const res = await fetch("/api/details/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const data = await res.json();
      if (res.ok) toast.success("Razorpay details updated!");
      else toast.error(data.error || "Failed to update details");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSavingDetails(false);
    }
  };

  if (loading) return <p className="text-center mt-20">Loading profile...</p>;

  return (
    <div className="max-w-6xl mx-36 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* User Profile Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Profile</CardTitle>
            {user.image && (
              <Image
                src={user.image}
                alt="Profile"
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover mx-auto mt-4 border-4 border-white shadow-md"
              />
            )}
            <div className="flex items-end justify-center pt-4 px-4">
              <p
                className={`text-sm font-semibold w-fit px-3 py-1 rounded-full inline-block ${
                  user.role === "ADMIN"
                    ? "bg-red-100 text-red-700"
                    : user.role === "OWNER"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user.role}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUserSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  name="name"
                  value={user.name || ""}
                  onChange={handleUserChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  name="email"
                  value={user.email}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Input
                  name="address"
                  value={user.address || ""}
                  onChange={handleUserChange}
                />
              </div>

              <Button type="submit" className="w-full " disabled={savingUser}>
                {savingUser ? "Saving..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Razorpay Details Card */}
        <Card>
          <CardHeader className="flex items-start justify-between">
            <CardTitle className="text-2xl">Razorpay Details</CardTitle>
          </CardHeader>
          <div className="flex items-end justify-end px-4">
            {details.verified ? (
              <span className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-100 border border-green-400 px-2 py-0.5 rounded-full">
                <BadgeCheck className="w-4 h-4" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm text-red-600 bg-red-100 border border-red-400 px-2 py-0.5 rounded-full">
                <ShieldX className="w-4 h-4" />
                Unverified
              </span>
            )}
          </div>

          <CardContent>
            <form onSubmit={handleDetailsSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key
                </label>
                <Input
                  name="key"
                  value={details.key}
                  onChange={handleDetailsChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret
                </label>
                <Input
                  name="secret"
                  value={details.secret}
                  onChange={handleDetailsChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization ID
                </label>
                <Input
                  name="organizationId"
                  value={details.organizationId}
                  onChange={handleDetailsChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <Input
                  name="organizationName"
                  value={(details as any).organizationName || ""}
                  onChange={handleDetailsChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Address
                </label>
                <Input
                  name="organizationAddress"
                  value={(details as any).organizationAddress || ""}
                  onChange={handleDetailsChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number
                </label>
                <Input
                  name="gstNumber"
                  value={(details as any).gstNumber || ""}
                  onChange={handleDetailsChange}
                />
              </div>

              <Button type="submit" className="w-full" disabled={savingDetails}>
                {savingDetails ? "Saving..." : "Update Razorpay Details"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
