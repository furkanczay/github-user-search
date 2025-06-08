"use client";
import { useState } from "react";
import { FaLink, FaSearch, FaTwitter } from "react-icons/fa";
import { FaHouse, FaLocationPin } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";

interface GitHubUser {
  avatar_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  login: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  twitter_username: string | null;
  blog: string | null;
  company: string | null;
}

interface ApiResponse {
  data?: GitHubUser;
  error?: string;
  fromCache?: boolean;
  rateLimit?: {
    remaining: number;
    resetTime: string;
  };
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rateLimit, setRateLimit] = useState<{
    remaining: number;
    resetTime: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setIsSubmitted(true);
    setLoading(true);
    setError("");
    setUserData(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: search.trim() }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Bir hata oluştu");
      }

      if (result.data) {
        setUserData(result.data);
        setRateLimit(result.rateLimit || null);
      } else {
        setError("Kullanıcı bulunamadı");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="font-extrabold text-2xl">Github User Search</h1>
          <ThemeSwitcher />
        </div>

        {/* Search Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Github kullanıcı adıyla arama yap..."
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                disabled={!search.trim() || loading}
                className="min-w-[80px]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ara"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Rate Limit Info */}
        {rateLimit && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="p-4">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                API Limit: {rateLimit.remaining} istek kaldı. Sıfırlanma:{" "}
                {new Date(rateLimit.resetTime).toLocaleTimeString("tr-TR")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Kullanıcı aranıyor...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* User Data */}
        {isSubmitted && userData && !loading && (
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Avatar */}
                <div className="md:col-span-3 flex justify-center md:justify-start">
                  <Avatar className="w-24 h-24 md:w-32 md:h-32">
                    <AvatarImage
                      src={userData.avatar_url}
                      alt={userData.login}
                    />
                    <AvatarFallback>
                      {userData.login.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* User Info */}
                <div className="md:col-span-9 flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {userData.name || userData.login}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      Katılım:{" "}
                      {new Date(userData.created_at).toLocaleDateString(
                        "tr-TR"
                      )}
                    </span>
                  </div>

                  <span className="text-primary font-medium">
                    @{userData.login}
                  </span>
                  <p className="text-muted-foreground">
                    {userData.bio || "Biyografi eklenmemiş"}
                  </p>

                  {/* Stats */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="font-bold text-lg">
                            {userData.public_repos}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Repos
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-lg">
                            {userData.followers}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Followers
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-lg">
                            {userData.following}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Following
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm">
                      <FaLocationPin className="text-muted-foreground" />
                      <span>{userData.location || "Belirtilmemiş"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FaTwitter className="text-muted-foreground" />
                      <span>
                        {userData.twitter_username || "Belirtilmemiş"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FaLink className="text-muted-foreground" />
                      {userData.blog ? (
                        <a
                          href={
                            userData.blog.startsWith("http")
                              ? userData.blog
                              : `https://${userData.blog}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          {userData.blog}
                        </a>
                      ) : (
                        <span>Belirtilmemiş</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FaHouse className="text-muted-foreground" />
                      <span>{userData.company || "Belirtilmemiş"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
