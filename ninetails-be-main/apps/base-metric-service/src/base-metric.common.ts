// Hàm tính phần trăm số xe hoạt động
export function calculateVehicleOperationRate(data: any[]): number {
  const vehicleIds = new Set(data.map((vehicle) => vehicle.vehicle_id));
  const totalVehicles = vehicleIds.size;
  const activeVehicleIds = new Set(
    data
      .filter((vehicle) => vehicle.drive_mode === 1)
      .map((vehicle) => vehicle.drive_mode),
  );
  const activeVehicles = activeVehicleIds.size;
  return (activeVehicles / totalVehicles) * 100;
}

// Hàm tính phần trăm eco_score
export function calculateEcoScore(data: any[]): number {
  const vehicleIds = [...new Set(data.map((vehicle) => vehicle.vehicle_id))];
  const ecoScores = vehicleIds.map((id) => {
    const vehicleRecords = data.filter((vehicle) => vehicle.vehicle_id === id);
    return (
      vehicleRecords.reduce((sum, vehicle) => sum + vehicle.eco_score, 0) /
      vehicleRecords.length
    );
  });
  return ecoScores.reduce((sum, score) => sum + score, 0) / vehicleIds.length;
}

// Hàm tính thời gian hoạt động của xe
export function calculateOperatingTime(data: any[]): number {
  const vehicleIds = [...new Set(data.map((vehicle) => vehicle.vehicle_id))];
  const operatingTimes = vehicleIds.map((id) => {
    const vehicleRecords = data.filter((vehicle) => vehicle.vehicle_id === id);
    return vehicleRecords.reduce(
      (sum, vehicle) => sum + parseDuration(vehicle.trip_time),
      0,
    );
  });
  return operatingTimes.reduce((sum, time) => sum + time, 0);
}

// Hàm tính số lượng rác đã thu thập
export function calculateCollectionAmount(data: any[]): number {
  return data.length;
}

// Hàm tính số lượng cân nặng rác đã thu thâp
export function calculateCollectionWeight(data: any[]): number {
  return data.reduce((sum, vehicle) => sum + vehicle?.data?.capacity_kg, 0);
}

// Hàm tính số thời gian thu thập rác
export function calculateCollectionTime(data: any[]): number {
  return data.reduce((sum, vehicle) => sum + vehicle.idling, 0);
}

// Hàm hỗ trợ để chuyển đổi thời gian thành giây
export function parseDuration(duration: string): number {
  const parts = duration.split(':');
  return (
    parseInt(parts[0], 10) * 60 +
    parseInt(parts[1], 10) +
    parseInt(parts[2], 10) / 60
  );
}
