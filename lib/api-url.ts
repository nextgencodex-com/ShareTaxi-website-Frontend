const LOCAL_API_HOST = /^https?:\/\/localhost(?::5000)/i

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "")

const normalizeConfiguredBase = (value: string | undefined) => {
  const trimmed = trimTrailingSlashes(value?.trim() ?? "")
  return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed
}

const normalizeApiPath = (path: string) => {
  const trimmed = path.trim()

  if (!trimmed) {
    return "/api"
  }

  const withoutLocalHost = trimmed.replace(LOCAL_API_HOST, "")
  const normalized = withoutLocalHost.startsWith("/") ? withoutLocalHost : `/${withoutLocalHost}`

  if (normalized === "/api" || normalized.startsWith("/api/")) {
    return normalized
  }

  return `/api${normalized}`
}

export const API_BASE_URL = normalizeConfiguredBase(process.env.NEXT_PUBLIC_API_URL)

export const buildApiUrl = (path: string) => {
  const normalizedPath = normalizeApiPath(path)
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}

export const buildVehicleImageUrl = (imageName: string) => {
  const normalizedName = imageName
    .replace(LOCAL_API_HOST, "")
    .replace(/^\/?api\/vehicle-images\/?/i, "")
    .replace(/^\/+/, "")

  return buildApiUrl(`/vehicle-images/${normalizedName}`)
}

export const resolveApiAssetUrl = (url: string) => {
  const trimmed = url.trim()

  if (!trimmed) {
    return trimmed
  }

  if (LOCAL_API_HOST.test(trimmed)) {
    return buildApiUrl(trimmed.replace(LOCAL_API_HOST, ""))
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed
  }

  if (trimmed.startsWith("/api/")) {
    return buildApiUrl(trimmed)
  }

  if (trimmed.startsWith("api/")) {
    return buildApiUrl(`/${trimmed}`)
  }

  return trimmed
}
