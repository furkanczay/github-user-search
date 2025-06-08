import { NextRequest, NextResponse } from "next/server";

interface CacheEntry {
  data: any;
  timestamp: number;
  rateLimit?: {
    remaining: number;
    resetTime: string;
  };
}

// In-memory cache (production'da Redis kullanın)
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 dakika

// Rate limiting için son istek zamanlarını takip et
const requestTracker = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 dakika
const RATE_LIMIT_MAX_REQUESTS = 10; // Dakikada maksimum 10 istek

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const requests = requestTracker.get(clientId) || [];

  // Eski istekleri temizle
  const recentRequests = requests.filter(
    (time) => now - time < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  // Yeni isteği ekle
  recentRequests.push(now);
  requestTracker.set(clientId, recentRequests);
  return false;
}

function getClientId(request: NextRequest): string {
  // IP adresini al (production'da proxy ayarlarına dikkat edin)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientId(request);

    // Rate limiting kontrolü
    if (isRateLimited(clientId)) {
      return NextResponse.json(
        {
          error: "Çok fazla istek gönderdiniz. Lütfen 1 dakika bekleyin.",
          rateLimited: true,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const username = body.username?.toLowerCase()?.trim();

    if (!username) {
      return NextResponse.json(
        { error: "Kullanıcı adı gerekli" },
        { status: 400 }
      );
    }

    // Cache kontrolü
    const cacheKey = `user:${username}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        data: cachedData.data,
        fromCache: true,
        rateLimit: cachedData.rateLimit,
      });
    }

    // GitHub API'den veri çek
    const githubToken = process.env.GITHUB_TOKEN; // GitHub Personal Access Token ekleyin
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "github-user-search-app",
    };

    if (githubToken) {
      headers["Authorization"] = `token ${githubToken}`;
    }

    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 300 }, // Next.js cache: 5 dakika
    });

    // Rate limit bilgilerini al
    const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
    const rateLimitReset = response.headers.get("x-ratelimit-reset");

    const rateLimit =
      rateLimitRemaining && rateLimitReset
        ? {
            remaining: parseInt(rateLimitRemaining),
            resetTime: new Date(parseInt(rateLimitReset) * 1000).toISOString(),
          }
        : undefined;

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Kullanıcı bulunamadı" },
          { status: 404 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          {
            error:
              "GitHub API rate limit aşıldı. Lütfen daha sonra tekrar deneyin.",
          },
          { status: 403 }
        );
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache'e kaydet
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      rateLimit,
    });

    return NextResponse.json({
      data,
      fromCache: false,
      rateLimit,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Arama sırasında bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
