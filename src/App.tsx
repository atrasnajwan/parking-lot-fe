import { MantineProvider, AppShell, Container } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ParkingLotManager } from './components/ParkingLotManager';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

function App() {
  return (
    <MantineProvider>
      <Notifications position="top-right" />
      <AppShell>
        <Container size="xl" py="xl">
          <ParkingLotManager />
        </Container>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
