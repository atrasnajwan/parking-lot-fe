import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export interface Position {
  x: number;
  y: number;
}

export interface Vehicle {
  id: string;
  size: 'small' | 'medium' | 'large';
}

export interface Gate {
  id: string;
  position: Position;
}

export interface Slot {
  id: string;
  position: Position;
  size: 'small' | 'medium' | 'large';
  vehicle: Vehicle | null;
}

export interface ParkingLot {
  total_width: number;
  total_height: number;
  gates: Gate[];
  slots: Slot[];
}

export interface ParkingRecord {
  id: string;
  check_in_at: string;
  check_out_at: string | null;
  fee: number;
  duration: {
    days: number;
    hours: number;
  };
  slot: Slot;
  vehicle: Vehicle;
  gate: Gate;
  prev_record_id: string | null;
}

export interface FeeRulesType {
  currency: string;
  flat_rate: {
    hourly: number;
    daily: number;
    max_hours: number;
  };
  normal_rate: {
    slot_size: {
      small: number;
      medium: number;
      large: number;
    };
  };
}

const api = {
  // Parking Lot Management
  createParkingLot: (width: number, height: number, autoPopulate?: boolean, gateSize?: number) =>
    axios.post<ParkingLot>(`${API_BASE_URL}/parking_lot`, {
      width,
      height,
      auto_populate: autoPopulate,
      gate_size: gateSize,
    }),

  getParkingLot: () =>
    axios.get<ParkingLot>(`${API_BASE_URL}/parking_lot`),

  resetParkingLot: () =>
    axios.patch<ParkingLot>(`${API_BASE_URL}/parking_lot/reset`),

  deleteParkingLot: () =>
    axios.delete<ParkingLot>(`${API_BASE_URL}/parking_lot`),

  // Gate Management
  createGate: (x: number, y: number) =>
    axios.post<Gate>(`${API_BASE_URL}/parking_lot/gates`, { x, y }),

  getGate: (gateId: string) =>
    axios.get<Gate>(`${API_BASE_URL}/parking_lot/gates/${gateId}`),

  // Vehicle Management
  parkVehicle: (plateNumber: string, size: string, gateId: string, timeAt?: string) =>
    axios.post<ParkingRecord>(`${API_BASE_URL}/vehicles/park`, {
      plate_number: plateNumber,
      size,
      gate_id: gateId,
      time_at: timeAt,
    }),

  unparkVehicle: (plateNumber: string, timeAt?: string) =>
    axios.post<ParkingRecord>(`${API_BASE_URL}/vehicles/unpark`, {
      plate_number: plateNumber,
      time_at: timeAt,
    }),

  // Parking Records
  getAllParkingRecords: () =>
    axios.get<ParkingRecord[]>(`${API_BASE_URL}/parking_lot/parking_records`),

  getVehicleParkingRecords: (plateNumber: string) =>
    axios.get<ParkingRecord[]>(`${API_BASE_URL}/vehicles/${plateNumber}/parking_records`),

  // Fee Rules
  getFeeRules: () =>
    axios.get<FeeRulesType>(`${API_BASE_URL}/parking_lot/fee_rules`),
};

export default api; 