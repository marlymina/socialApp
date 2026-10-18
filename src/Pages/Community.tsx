import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";
import api from "../Services/api";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

export default function Community() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["community"],
    queryFn: async () => {
      const response = await api.get("/users/suggestions?page=1&limit=30");
      const data = response.data?.data;
      return Array.isArray(data)
        ? data
        : data?.suggestions || data?.users || [];
    },
  });

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.put(
        `/users/${userId}/follow`,
        {},
        {
          headers: { token: localStorage.getItem("token") || "" },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community"] });
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Updated follow status");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update follow status",
      );
    },
  });

  const users = (query.data || []).filter(
    (user: { name?: string; userName?: string; username?: string }) =>
      `${user.name || ""} ${user.userName || user.username || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <section className="notifications-page card">
      <Helmet>
        <title>Community | Route Posts</title>
      </Helmet>
      <div className="section-heading">
        <div>
          <span className="heading-icon">
            <Users size={22} />
          </span>
          <div>
            <h1>Community</h1>
            <p>Find people to connect with</p>
          </div>
        </div>
      </div>
      <div className="friend-search">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search people..."
        />
      </div>
      {query.isLoading ? (
        <div className="empty-state">Loading community...</div>
      ) : users.length ? (
        <div className="community-grid">
          {users.map(
            (
              person: {
                _id?: string;
                id?: string;
                name?: string;
                userName?: string;
                username?: string;
                photo?: string;
                image?: string;
                isFollowing?: boolean;
              },
              index: number,
            ) => {
              const personId = person._id || person.id || "";
              return (
                <div className="community-person" key={personId || index}>
                  <Link
                    to={`/profile/${personId}`}
                    className="flex flex-col items-center gap-2 w-full text-center"
                  >
                    <img
                      src={
                        person.photo ||
                        person.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || "Friend")}`
                      }
                      alt=""
                    />
                    <strong>
                      {person.name ||
                        person.userName ||
                        person.username ||
                        "Route member"}
                    </strong>
                    <span>
                      @{person.userName || person.username || "member"}
                    </span>
                  </Link>
                  <button
                    onClick={() => followMutation.mutate(personId)}
                    disabled={followMutation.isPending}
                    className={`mt-2 w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      person.isFollowing
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {person.isFollowing ? (
                      <>
                        <UserCheck size={14} /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} /> Follow
                      </>
                    )}
                  </button>
                </div>
              );
            },
          )}
        </div>
      ) : (
        <div className="empty-state">No members found.</div>
      )}
    </section>
  );
}
