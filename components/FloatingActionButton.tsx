// components/FloatingActionButton.tsx

import React, { useState } from 'react';
import { FAB, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modals from './Modals';

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleFabPress = (modalId: string) => {
    setActiveModal(modalId);
    setOpen(false);
  };

  return (
    <Portal>
      <FAB.Group
        open={open}
        icon={open ? 'arrow-down' : 'plus'}
        style={{
          position: 'absolute',
          right: 0,
          bottom: insets.bottom + 50,
        }}
        actions={[
          { icon: 'food', label: 'Meal', onPress: () => handleFabPress('modal1') },
          { icon: 'water', label: 'Hydration', onPress: () => handleFabPress('modal2') },
          { icon: 'run', label: 'Lifestyle', onPress: () => handleFabPress('modal3') },
          { icon: 'heart', label: 'Symptom', onPress: () => handleFabPress('modal4') },
          { icon: 'toilet', label: 'Bowel Movement', onPress: () => handleFabPress('modal5') },
          { icon: 'pill', label: 'Prescription', onPress: () => handleFabPress('modal6') },
          { icon: 'calendar', label: 'Appointment', onPress: () => handleFabPress('modal7') },
        ]}
        onStateChange={({ open }) => setOpen(open)}
        onPress={() => {
          /* optional extra behavior when FAB is open */
        }}
      />
      <Modals activeModal={activeModal} onDismiss={() => setActiveModal(null)} />
    </Portal>
  );
}
