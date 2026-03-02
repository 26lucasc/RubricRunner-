"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Resolves the user's IANA timezone ID.
 * Uses Google Time Zone API with browser Geolocation when permitted,
 * otherwise falls back to the browser's system timezone (Intl).
 */
export function useUserTimezone() {
  const [timeZoneId, setTimeZoneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const resolve = useCallback(async () => {
    const fallback = () => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        return "UTC";
      }
    };

    if (typeof sessionStorage !== "undefined") {
      const cached = sessionStorage.getItem("rubricrunner_timezone");
      if (cached) {
        setTimeZoneId(cached);
        setLoading(false);
        return;
      }
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const tz = fallback();
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("rubricrunner_timezone", tz);
      }
      setTimeZoneId(tz);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `/api/timezone?lat=${latitude}&lng=${longitude}`
          );
          const data = await res.json();

          if (res.ok && data.timeZoneId) {
            sessionStorage.setItem("rubricrunner_timezone", data.timeZoneId);
            setTimeZoneId(data.timeZoneId);
          } else {
            const tz = fallback();
            sessionStorage.setItem("rubricrunner_timezone", tz);
            setTimeZoneId(tz);
          }
        } catch {
          const tz = fallback();
          sessionStorage.setItem("rubricrunner_timezone", tz);
          setTimeZoneId(tz);
        } finally {
          setLoading(false);
        }
      },
      () => {
        const tz = fallback();
        sessionStorage.setItem("rubricrunner_timezone", tz);
        setTimeZoneId(tz);
        setLoading(false);
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  }, []);

  useEffect(() => {
    resolve();
  }, [resolve]);

  return { timeZoneId, loading };
}
