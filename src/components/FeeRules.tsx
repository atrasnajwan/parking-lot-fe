import { useEffect, useState } from 'react';
import { Paper, Text, Stack, Group } from '@mantine/core';
import api, { type FeeRulesType } from '../services/api';

export function FeeRules() {
  const [feeRules, setFeeRules] = useState<FeeRulesType | null>(null);

  useEffect(() => {
    api.getFeeRules()
      .then(response => setFeeRules(response.data))
      .catch(error => console.error('Failed to load fee rules:', error));
  }, []);

  if (!feeRules) return null;

  return (
    <Paper withBorder p="md">
      <Text fw={500} mb="md">Fee Rules</Text>
      <Stack gap="xs">
        <Group>
          <Text size="sm" fw={500}>Flat Rate (First {feeRules.flat_rate.max_hours} hours):</Text>
          <Text size="sm">{feeRules.flat_rate.hourly} {feeRules.currency}</Text>
        </Group>
        <Group>
          <Text size="sm" fw={500}>Daily Rate:</Text>
          <Text size="sm">{feeRules.flat_rate.daily} {feeRules.currency}</Text>
        </Group>
        <Text size="sm" fw={500} mt="xs">Hourly Rates by Slot Size:</Text>
        <Group gap="lg">
          <Group gap="xs">
            <Text size="sm" c="green">Small:</Text>
            <Text size="sm">{feeRules.normal_rate.slot_size.small} {feeRules.currency}</Text>
          </Group>
          <Group gap="xs">
            <Text size="sm" c="yellow">Medium:</Text>
            <Text size="sm">{feeRules.normal_rate.slot_size.medium} {feeRules.currency}</Text>
          </Group>
          <Group gap="xs">
            <Text size="sm" c="blue">Large:</Text>
            <Text size="sm">{feeRules.normal_rate.slot_size.large} {feeRules.currency}</Text>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
} 