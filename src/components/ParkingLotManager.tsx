import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Grid,
  NumberInput,
  Select,
  TextInput,
  Modal,
  Switch,
  Badge,
  Divider,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconCar, IconGaugeOff, IconCarGarage, IconDoor, IconX, IconTrash, IconTicket } from '@tabler/icons-react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import api, { type ParkingLot, type ParkingRecord, type Slot, type Vehicle, type Gate } from '../services/api';
import { FeeRules } from './FeeRules';

interface ApiErrorResponse {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
}

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    // Try to get the error message from the API response
    const errorData = axiosError.response?.data;
    if (errorData?.errors) {
      // Collect all error messages from all fields
      const messages = Object.entries(errorData.errors)
        .map(([field, errors]) => errors.map(err => `${field}: ${err}`))
        .flat();
      return messages.join('\n');
    }
    if (errorData?.message) return errorData.message;
    // Fallback to the error message if no API message
    if (axiosError.message) return axiosError.message;
  } else if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

const showError = (title: string, error: unknown, fallbackMessage?: string) => {
  const message = getErrorMessage(error);
  notifications.show({
    title,
    message: message || fallbackMessage || 'An unexpected error occurred',
    color: 'red',
    icon: <IconX size={16} />,
    autoClose: 5000,
    styles: {
      description: {
        whiteSpace: 'pre-line' // This allows line breaks in the message
      }
    }
  });
};

// Constants
const CELL_SIZE = 55;
const CELL_GAP = 8;

// Constants for slot colors
const SLOT_COLORS = {
  small: 'green',
  medium: 'yellow',
  large: 'blue',
} as const;

export function ParkingLotManager() {
  const [parkingLot, setParkingLot] = useState<ParkingLot | null>(null);
  const [parkingRecords, setParkingRecords] = useState<ParkingRecord[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);
  const [isParking, setIsParking] = useState(false);
  const [isAddingGate, setIsAddingGate] = useState(false);
  const [isCreatingLot, setIsCreatingLot] = useState(false);
  const [createLotForm, setCreateLotForm] = useState({
    width: 3,
    height: 3,
    autoPopulate: true,
    gateSize: 3,
  });
  const [gateForm, setGateForm] = useState({
    x: 0,
    y: 0,
  });
  const [parkingForm, setParkingForm] = useState({
    plateNumber: '',
    size: 'small' as Vehicle['size'],
    gateId: '',
    timeAt: new Date(),
  });
  const [unparkTime, setUnparkTime] = useState<Date | null>(null);
  const [isManualUnparking, setIsManualUnparking] = useState(false);
  const [manualUnparkForm, setManualUnparkForm] = useState({
    plateNumber: '',
    timeAt: new Date(),
  });
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);

  const loadParkingLot = async () => {
    try {
      const response = await api.getParkingLot();
      setParkingLot(response.data);
    } catch (error) {
      showError('Failed to Load Parking Lot', error, 'Could not load parking lot data');
      console.error('Failed to load parking lot:', error);
    }
  };

  const loadParkingRecords = async () => {
    try {
      const response = await api.getAllParkingRecords();
      setParkingRecords(response.data);
    } catch (error) {
      showError('Failed to Load Records', error, 'Could not load parking records');
      console.error('Failed to load parking records:', error);
    }
  };

  useEffect(() => {
    loadParkingLot();
    loadParkingRecords();
  }, []);

  const handleCreateParkingLot = async () => {
    try {
      await api.createParkingLot(
        createLotForm.width,
        createLotForm.height,
        createLotForm.autoPopulate,
        createLotForm.gateSize
      );
      loadParkingLot();
      setIsCreatingLot(false);
      notifications.show({
        title: 'Success',
        message: 'Parking lot created successfully',
        color: 'green',
      });
    } catch (error) {
      showError('Failed to Create Parking Lot', error, 'Could not create parking lot');
      console.error('Failed to create parking lot:', error);
    }
  };

  const handleDeleteParkingLot = async () => {
    try {
      await api.deleteParkingLot();
      setParkingLot(null);
      setParkingRecords([]);
      notifications.show({
        title: 'Success',
        message: 'Parking lot deleted successfully',
        color: 'green',
      });
    } catch (error) {
      showError('Failed to Delete Parking Lot', error, 'Could not delete parking lot');
      console.error('Failed to delete parking lot:', error);
    }
  };

  const handleCreateGate = async () => {
    try {
      await api.createGate(gateForm.x, gateForm.y);
      loadParkingLot();
      setIsAddingGate(false);
      setGateForm({ x: 0, y: 0 });
    } catch (error) {
      showError('Failed to Create Gate', error, 'Could not create gate. Make sure the position is valid.');
      console.error('Failed to create gate:', error);
    }
  };

  const handleParkVehicle = async () => {
    try {
      await api.parkVehicle(
        parkingForm.plateNumber,
        parkingForm.size,
        parkingForm.gateId,
        dayjs(parkingForm.timeAt).format('YYYY-MM-DD HH:mm:ss')
      );
      loadParkingLot();
      loadParkingRecords();
      setIsParking(false);
      setSelectedGate(null);
      setParkingForm({ 
        plateNumber: '', 
        size: 'small', 
        gateId: '',
        timeAt: new Date(),
      });
    } catch (error) {
      showError('Failed to Park Vehicle', error, 'Could not park vehicle. Please check all fields and try again.');
      console.error('Failed to park vehicle:', error);
    }
  };

  const handleUnparkVehicle = async (plateNumber: string, timeAt?: Date) => {
    try {
      await api.unparkVehicle(
        plateNumber,
        timeAt ? dayjs(timeAt).format('YYYY-MM-DD HH:mm:ss') : undefined
      );
      loadParkingLot();
      loadParkingRecords();
      setSelectedSlot(null);
      setUnparkTime(null);
    } catch (error) {
      showError('Failed to Unpark Vehicle', error, 'Could not unpark vehicle');
      console.error('Failed to unpark vehicle:', error);
    }
  };

  const getSlotColor = (slot: Slot) => {
    if (slot.vehicle) return 'red';
    return SLOT_COLORS[slot.size];
  };

  const formatDateTime = (date: string) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  };

  const handleRecordClick = (record: ParkingRecord) => {
    setSelectedRecord(record);
    setUnparkTime(new Date(record.check_in_at));
  };

  const handleUnparkClick = () => {
    handleUnparkVehicle(selectedRecord!.vehicle.id, unparkTime || new Date());
    setSelectedRecord(null);
  };

  const handleSlotClick = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  const handleCloseSlotModal = () => {
    setSelectedSlot(null);
  };

  const handleCloseRecordModal = () => {
    setSelectedRecord(null);
  };

  const handleCloseParkingModal = () => {
    setIsParking(false);
    setSelectedGate(null);
    setParkingForm({
      plateNumber: '',
      size: 'small',
      gateId: '',
      timeAt: new Date(),
    });
  };

  const handleCloseGateModal = () => {
    setIsAddingGate(false);
    setGateForm({ x: 0, y: 0 });
  };

  const handleCreateLotClick = () => {
    setIsCreatingLot(true);
  };

  const handleCloseLotModal = () => {
    setIsCreatingLot(false);
  };

  const handleCloseManualUnparkModal = () => {
    setIsManualUnparking(false);
    setManualUnparkForm({
      plateNumber: '',
      timeAt: new Date(),
    });
  };

  const handleManualUnpark = () => {
    handleUnparkVehicle(manualUnparkForm.plateNumber, manualUnparkForm.timeAt);
    handleCloseManualUnparkModal();
  };

  const handleGateClick = (gate: Gate) => {
    setSelectedGate(gate);
    setParkingForm(prev => ({ ...prev, gateId: gate.id }));
    setIsParking(true);
  };

  if (!parkingLot) {
    return (
      <Box ta="center" py="xl">
        <Text size="xl" mb="md">No Parking Lot Available</Text>
        <Button 
          onClick={handleCreateLotClick}
          leftSection={<IconCarGarage size={20} />}
        >
          Create Parking Lot
        </Button>

        <Modal
          opened={isCreatingLot}
          onClose={handleCloseLotModal}
          title="Create Parking Lot"
        >
          <Stack>
            <NumberInput
              label="Width"
              description="Number of columns (horizontal slot count)"
              value={createLotForm.width}
              onChange={(value) => setCreateLotForm(prev => ({ ...prev, width: Number(value) || 3 }))}
              min={2}
              max={10}
            />
            <NumberInput
              label="Height"
              description="Number of rows (vertical slot count)"
              value={createLotForm.height}
              onChange={(value) => setCreateLotForm(prev => ({ ...prev, height: Number(value) || 3 }))}
              min={2}
              max={10}
            />
            <Switch
              label="Auto-populate gates"
              description="Automatically generate gates with default size and random position"
              checked={createLotForm.autoPopulate}
              onChange={(event) => setCreateLotForm(prev => ({ ...prev, autoPopulate: event.currentTarget.checked }))}
            />
            {createLotForm.autoPopulate && (
              <NumberInput
                label="Gate Size"
                description="Number of slots near each gate"
                value={createLotForm.gateSize}
                onChange={(value) => setCreateLotForm(prev => ({ ...prev, gateSize: Number(value) || 3 }))}
                min={1}
                max={5}
              />
            )}
            <Button onClick={handleCreateParkingLot}>Create</Button>
          </Stack>
        </Modal>
      </Box>
    );
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Text size="xl" fw={700}>Parking Lot Manager</Text>
        <Group>
          <Button
            variant="light"
            color="blue"
            onClick={() => setIsParking(true)}
            leftSection={<IconCar size={20} />}
          >
            Park Vehicle
          </Button>
          <Button
            variant="light"
            color="red"
            onClick={() => setIsManualUnparking(true)}
            leftSection={<IconGaugeOff size={20} />}
          >
            Unpark Vehicle
          </Button>
          <Button
            variant="light"
            color="green"
            onClick={() => setIsAddingGate(true)}
            leftSection={<IconDoor size={20} />}
          >
            Add Gate
          </Button>
          <Button
            variant="light"
            color="red"
            onClick={() => api.resetParkingLot().then(() => {
              loadParkingLot();
              loadParkingRecords();
            })}
            leftSection={<IconGaugeOff size={20} />}
          >
            Reset
          </Button>
          <Button
            variant="light"
            color="red"
            onClick={handleDeleteParkingLot}
            leftSection={<IconTrash size={20} />}
          >
            Delete
          </Button>
        </Group>
      </Group>

      <Grid>
        <Grid.Col span={8}>
          <Paper withBorder p="md">
            <Text fw={500} mb="md">Parking Lot Layout</Text>
            <Box>
              {/* Y-axis labels */}
              <Group align="flex-start" gap={0} wrap="nowrap">
                <Stack gap={CELL_GAP} justify="flex-start" w={CELL_SIZE} mt={24}>
                  {Array.from({ length: parkingLot.total_height }).map((_, index) => (
                    <Text 
                      key={index} 
                      size="xs" 
                      c="dimmed" 
                      ta="center"
                      h={CELL_SIZE}
                      style={{ 
                        lineHeight: `${CELL_SIZE}px`
                      }}
                    >
                      {index}
                    </Text>
                  ))}
                </Stack>

                <Box style={{ flex: 1 }}>
                  {/* X-axis labels */}
                  <Group gap={CELL_GAP} mb={CELL_GAP} pl={0}>
                    {Array.from({ length: parkingLot.total_width }).map((_, index) => (
                      <Text 
                        key={index} 
                        size="xs" 
                        c="dimmed"
                        w={CELL_SIZE}
                        ta="center"
                      >
                        {index}
                      </Text>
                    ))}
                  </Group>

                  {/* Parking lot grid */}
                  <Box
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${parkingLot.total_width}, ${CELL_SIZE}px)`,
                      gap: `${CELL_GAP}px`,
                    }}
                  >
                    {Array.from({ length: parkingLot.total_height * parkingLot.total_width }).map((_, index) => {
                      const x = index % parkingLot.total_width;
                      const y = Math.floor(index / parkingLot.total_width);
                      const slot = parkingLot.slots.find(s => s.position.x === x && s.position.y === y);
                      const gate = parkingLot.gates.find(g => g.position.x === x && g.position.y === y);

                      return (
                        <Box
                          key={`${x},${y}`}
                          style={{
                            aspectRatio: '1',
                            backgroundColor: slot ? getSlotColor(slot) : gate ? 'purple' : 'gray',
                            borderRadius: '4px',
                            cursor: slot ? 'pointer' : gate ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                          }}
                          onClick={() => {
                            if (slot) {
                              handleSlotClick(slot);
                            } else if (gate) {
                              handleGateClick(gate);
                            }
                          }}
                        >
                          {gate ? 'G' : slot?.vehicle?.id || ''}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Group>

              {/* Legend */}
              <Box mt="xl">
                <Text fw={500} mb="xs">Legend:</Text>
                <Group gap="lg">
                  <Group gap="xs">
                    <Box style={{ width: 20, height: 20, backgroundColor: 'green', borderRadius: 4 }} />
                    <Text size="sm">Small Slot</Text>
                  </Group>
                  <Group gap="xs">
                    <Box style={{ width: 20, height: 20, backgroundColor: 'yellow', borderRadius: 4 }} />
                    <Text size="sm">Medium Slot</Text>
                  </Group>
                  <Group gap="xs">
                    <Box style={{ width: 20, height: 20, backgroundColor: 'blue', borderRadius: 4 }} />
                    <Text size="sm">Large Slot</Text>
                  </Group>
                  <Group gap="xs">
                    <Box style={{ width: 20, height: 20, backgroundColor: 'red', borderRadius: 4 }} />
                    <Text size="sm">Occupied Slot</Text>
                  </Group>
                  <Group gap="xs">
                    <Box style={{ width: 20, height: 20, backgroundColor: 'purple', borderRadius: 4 }} />
                    <Text size="sm">Gate</Text>
                  </Group>
                </Group>
              </Box>
            </Box>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Stack>
          <FeeRules />
            <Paper withBorder p="md">
              <Text fw={500} mb="md">Recent Parking Records</Text>
              <Stack>
                {parkingRecords.map(record => (
                  <Paper 
                    key={record.id} 
                    withBorder 
                    p="xs"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRecordClick(record)}
                  >
                    <Group justify="space-between">
                      <div>
                        <Text size="sm" fw={500}>{record.vehicle.id}</Text>
                        <Text size="xs" c="dimmed">
                          {formatDateTime(record.check_in_at)}
                        </Text>
                      </div>
                      <Badge color={record.check_out_at ? 'green' : 'blue'}>
                        {record.check_out_at ? 'Completed' : 'Active'}
                      </Badge>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      <Modal
        opened={isParking}
        onClose={handleCloseParkingModal}
        title={selectedGate ? `Park Vehicle at Gate (${selectedGate.position.x}, ${selectedGate.position.y})` : "Park Vehicle"}
      >
        <Stack>
          <TextInput
            label="Plate Number"
            value={parkingForm.plateNumber}
            onChange={(e) => setParkingForm(prev => ({ ...prev, plateNumber: e.target.value }))}
          />
          <Select
            label="Vehicle Size"
            value={parkingForm.size}
            onChange={(value) => setParkingForm(prev => ({ ...prev, size: value as Vehicle['size'] }))}
            data={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]}
          />
          {!selectedGate && (
            <Select
              label="Entry Gate"
              value={parkingForm.gateId}
              onChange={(value) => setParkingForm(prev => ({ ...prev, gateId: value || '' }))}
              data={parkingLot.gates.map(gate => ({
                value: gate.id,
                label: `Gate at (${gate.position.x}, ${gate.position.y})`,
              }))}
            />
          )}
          <DateTimePicker
            label="Check-in Time"
            placeholder="Pick date and time"
            valueFormat="YYYY-MM-DD HH:mm:ss"
            value={parkingForm.timeAt}
            onChange={(value) => setParkingForm(prev => ({ ...prev, timeAt: value || new Date() }))}
            clearable={false}
            defaultValue={new Date()}
            withSeconds
          />
          <Button onClick={handleParkVehicle}>Park</Button>
        </Stack>
      </Modal>

      <Modal
        opened={isAddingGate}
        onClose={handleCloseGateModal}
        title="Add New Gate"
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Gates must be placed on the outer border of the parking lot.
            Valid coordinates are:
            X: 0 to {parkingLot?.total_width - 1},
            Y: 0 to {parkingLot?.total_height - 1}
          </Text>
          <NumberInput
            label="X Position"
            value={gateForm.x}
            onChange={(value) => setGateForm(prev => ({ ...prev, x: Number(value) || 0 }))}
            min={0}
            max={parkingLot?.total_width ? parkingLot.total_width - 1 : 0}
          />
          <NumberInput
            label="Y Position"
            value={gateForm.y}
            onChange={(value) => setGateForm(prev => ({ ...prev, y: Number(value) || 0 }))}
            min={0}
            max={parkingLot?.total_height ? parkingLot.total_height - 1 : 0}
          />
          <Button onClick={handleCreateGate}>Add Gate</Button>
        </Stack>
      </Modal>

      <Modal
        opened={!!selectedSlot}
        onClose={handleCloseSlotModal}
        title="Slot Details"
      >
        {selectedSlot && (
          <Stack>
            <Text>Position: ({selectedSlot.position.x}, {selectedSlot.position.y})</Text>
            <Group>
              <Text>Size:</Text>
              <Text 
                fw={500}
                c={SLOT_COLORS[selectedSlot.size]}
                style={{ textTransform: 'capitalize' }}
              >
                {selectedSlot.size}
              </Text>
            </Group>
            {selectedSlot.vehicle && (
              <>
                <Text>Occupied by: {selectedSlot.vehicle.id}</Text>
                <Group>
                  <Text>Vehicle size:</Text>
                  <Text 
                    fw={500}
                    c={SLOT_COLORS[selectedSlot.vehicle.size]}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {selectedSlot.vehicle.size}
                  </Text>
                </Group>
              </>
            )}
          </Stack>
        )}
      </Modal>

      <Modal
        opened={!!selectedRecord}
        onClose={handleCloseRecordModal}
        title={
          <Group>
            <IconTicket size={20} />
            <Text>Parking Ticket Details</Text>
          </Group>
        }
        size="lg"
      >
        {selectedRecord && (
          <Stack>
            <Paper withBorder p="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={700} size="lg">Ticket #{selectedRecord.id}</Text>
                  <Badge 
                    color={selectedRecord.check_out_at ? 'green' : 'blue'}
                    size="lg"
                  >
                    {selectedRecord.check_out_at ? 'Completed' : 'Active'}
                  </Badge>
                </Group>
                <Divider />
                
                <Text fw={500}>Vehicle Information</Text>
                <Group>
                  <Text>Plate Number:</Text>
                  <Text fw={500}>{selectedRecord.vehicle.id}</Text>
                </Group>
                <Group>
                  <Text>Vehicle Size:</Text>
                  <Text 
                    fw={500} 
                    style={{ textTransform: 'capitalize' }}
                    c={SLOT_COLORS[selectedRecord.vehicle.size]}
                  >
                    {selectedRecord.vehicle.size}
                  </Text>
                </Group>

                <Divider />
                
                <Text fw={500}>Parking Information</Text>
                <Group>
                  <Text>Entry Gate:</Text>
                  <Text fw={500}>Gate at ({selectedRecord.gate.position.x}, {selectedRecord.gate.position.y})</Text>
                </Group>
                <Group>
                  <Text>Parking Slot:</Text>
                  <Text fw={500}>
                    <Text 
                      span 
                      c={SLOT_COLORS[selectedRecord.slot.size]}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {selectedRecord.slot.size}
                    </Text>
                    {' '}slot at ({selectedRecord.slot.position.x}, {selectedRecord.slot.position.y})
                  </Text>
                </Group>

                <Divider />
                
                <Text fw={500}>Time & Fee Information</Text>
                <Group>
                  <Text>Check-in Time:</Text>
                  <Text fw={500}>{formatDateTime(selectedRecord.check_in_at)}</Text>
                </Group>
                {selectedRecord.check_out_at && (
                  <>
                    <Group>
                      <Text>Check-out Time:</Text>
                      <Text fw={500}>{formatDateTime(selectedRecord.check_out_at)}</Text>
                    </Group>
                    <Group>
                      <Text>Duration:</Text>
                      <Text fw={500}>
                        {selectedRecord.duration.days > 0 && `${selectedRecord.duration.days} days `}
                        {selectedRecord.duration.hours} hours
                      </Text>
                    </Group>
                    <Group>
                      <Text>Total Fee:</Text>
                      <Text fw={500} size="lg" c="blue">{selectedRecord.fee} pesos</Text>
                    </Group>
                  </>
                )}

                {!selectedRecord.check_out_at && (
                  <>
                    <DateTimePicker
                      label="Check-out Time"
                      placeholder="Pick date and time"
                      valueFormat="YYYY-MM-DD HH:mm:ss"
                      value={unparkTime || new Date(selectedRecord.check_in_at)}
                      onChange={setUnparkTime}
                      clearable={false}
                      defaultValue={new Date(selectedRecord.check_in_at)}
                      withSeconds
                    />
                    <Button
                      color="red"
                      onClick={handleUnparkClick}
                      leftSection={<IconCar size={20} />}
                    >
                      Unpark Vehicle
                    </Button>
                  </>
                )}
              </Stack>
            </Paper>
          </Stack>
        )}
      </Modal>

      <Modal
        opened={isManualUnparking}
        onClose={handleCloseManualUnparkModal}
        title="Unpark Vehicle Manually"
      >
        <Stack>
          <TextInput
            label="Plate Number"
            value={manualUnparkForm.plateNumber}
            onChange={(e) => setManualUnparkForm(prev => ({ ...prev, plateNumber: e.target.value }))}
          />
          <DateTimePicker
            label="Check-out Time"
            placeholder="Pick date and time"
            valueFormat="YYYY-MM-DD HH:mm:ss"
            value={manualUnparkForm.timeAt}
            onChange={(value) => setManualUnparkForm(prev => ({ ...prev, timeAt: value || new Date() }))}
            clearable={false}
            defaultValue={new Date()}
            withSeconds
          />
          <Button 
            onClick={handleManualUnpark}
            disabled={!manualUnparkForm.plateNumber}
          >
            Unpark
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
} 