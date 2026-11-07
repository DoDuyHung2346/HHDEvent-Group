"use client";

import { useState, useEffect, useCallback } from "react";
import type { Booking } from "@/lib/schemas";
import {
  loadBookings,
  saveBookings,
  addBooking,
  updateBookingStatus,
  deleteProcessedBooking,
} from "@/lib/booking/storage";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wasReset, setWasReset] = useState(false);

  useEffect(() => {
    const { bookings: loaded, wasReset: reset } = loadBookings();
    setBookings(loaded);
    setWasReset(reset);
  }, []);

  const add = useCallback((booking: Booking) => {
    addBooking(booking);
    const { bookings: fresh } = loadBookings();
    setBookings(fresh);
  }, []);

  const markProcessed = useCallback((id: string) => {
    updateBookingStatus(id, "processed");
    const { bookings: fresh } = loadBookings();
    setBookings(fresh);
  }, []);

  const deleteProcessed = useCallback((id: string): boolean => {
    const success = deleteProcessedBooking(id);
    if (success) {
      const { bookings: fresh } = loadBookings();
      setBookings(fresh);
    }
    return success;
  }, []);

  const refresh = useCallback(() => {
    const { bookings: fresh, wasReset: reset } = loadBookings();
    setBookings(fresh);
    if (reset) setWasReset(true);
  }, []);

  return { bookings, wasReset, add, markProcessed, deleteProcessed, refresh };
}
