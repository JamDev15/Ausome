import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Each medicine gets notifications identified by tags like `med_<medicineId>_0`, `med_<medicineId>_1` etc.
// We store scheduled IDs in a simple in-memory map (sufficient for single session; persisted via re-schedule on app start).

export async function scheduleMedicineNotifications(
  medicineId: string,
  medicineName: string,
  dosage: string,
  times: string[],   // ["08:00", "20:00"]
): Promise<void> {
  await cancelMedicineNotifications(medicineId);

  for (const time of times) {
    const [hourStr, minStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);
    if (isNaN(hour) || isNaN(minute)) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `med_${medicineId}_${hour}_${minute}`,
      content: {
        title: '💊 Medicine Reminder',
        body: `Time to take ${medicineName} — ${dosage}`,
        data: { medicineId },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }
}

export async function cancelMedicineNotifications(medicineId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(n => n.identifier.startsWith(`med_${medicineId}_`));
  await Promise.all(toCancel.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function rescheduleAllMedicines(
  medicines: Array<{ id: string; name: string; dosage: string; times: string[] }>,
): Promise<void> {
  for (const med of medicines) {
    await scheduleMedicineNotifications(med.id, med.name, med.dosage, med.times);
  }
}
