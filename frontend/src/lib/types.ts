export type Venue = {
  id: string;
  name: string;
  address: string;
  sportTypes: string[];
  pricePerHour: number;
  capacity: number;
  ownerId: string;
  createdAt: string;
};

export type SlotStatus = "AVAILABLE" | "HELD" | "BOOKED" | "EXPIRED" | "COMPLETED";

export type Slot = {
  id: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
};

export type VenueFilters = {
  sport?: string;
  maxPrice?: string;
  openToday?: boolean;
};
