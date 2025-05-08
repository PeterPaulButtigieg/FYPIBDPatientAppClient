import React, { useState } from 'react';
import { FAB, Portal, Provider as PaperProvider } from 'react-native-paper';
import Modals from './Modals';

const FloatingActionButton = () => {
  const [state, setState] = useState({ open: false });
  const { open } = state;

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const onStateChange = ({ open }: { open: boolean }) => setState({ open });

  const handleFabPress = (modalId: string) => {
    setActiveModal(modalId);
    // Close the FAB group
    setState({ open: false });
  };

  return (
    <PaperProvider>
      <Portal>
        <FAB.Group
          open={open}
          visible
          icon={open ? 'arrow-down' : 'plus'}
          actions={[
            {
              icon: 'food',
              label: 'Meal',
              onPress: () => handleFabPress('modal1'),
            },
            {
              icon: 'water',
              label: 'Hydration',
              onPress: () => handleFabPress('modal2'),
            },
            {
              icon: 'run',
              label: 'Lifestyle',
              onPress: () => handleFabPress('modal3'),
            },
            {
              icon: 'heart',
              label: 'Symptom',
              onPress: () => handleFabPress('modal4'),
            },
            {
              icon: 'toilet',
              label: 'Bowel Movement',
              onPress: () => handleFabPress('modal5'),
            },
            {
              icon: 'pill',
              label: 'Prescription',
              onPress: () => handleFabPress('modal6'),
            },
            {
              icon: 'calendar',
              label: 'Appointment',
              onPress: () => handleFabPress('modal7'),
            },
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // You can add extra actions here if needed when the FAB is open.
            }
          }}
        />
      </Portal>
      {/* Render the modals */}
      <Modals activeModal={activeModal} onDismiss={() => setActiveModal(null)} />
    </PaperProvider>
  );
};

export default FloatingActionButton;
