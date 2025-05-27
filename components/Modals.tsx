import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Modal, Button, Text } from 'react-native-paper';

//importing Forms
import HydrationForm from './HydrationLogForm';
import AppointmentForm from './AppointmentForm';
import PrescriptionForm from './PrescriptionForm';
import LifestyleForm from './LifestyleForm';
import BowelMovementForm from './BowelMovementForm';
import SymptomForm from './SymptomForm';
import DietForm from './DietForm';

export interface ModalsProps {
  activeModal: string | null; // Expected values: 'modal1', 'modal2', …, 'modal7'
  onDismiss: () => void;
}

const Modals: React.FC<ModalsProps> = ({ activeModal, onDismiss }) => {
  return (
    <Portal>
      {/* Modal 1 */}
      <Modal
        visible={activeModal === 'modal1'}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <DietForm onDismiss={onDismiss} />
      </Modal>

      {/* Modal 2 */}
      <Modal
        visible={activeModal === 'modal2'}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <HydrationForm onDismiss={onDismiss} />
      </Modal>

      {/* Modal 3 */}
      <Modal
        visible={activeModal === 'modal3'}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <LifestyleForm onDismiss={onDismiss} />
      </Modal>

      {/* Modal 4 */}
      <Modal
        visible={activeModal === 'modal4'}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <SymptomForm onDismiss={onDismiss} />
      </Modal>

      {/* Modal 5 */}
      <Modal
        visible={activeModal === 'modal5'}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <BowelMovementForm onDismiss={onDismiss} />
      </Modal>

      {/* Modal 6 */}
      <Modal
        visible={activeModal === 'modal6'}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <PrescriptionForm onDismiss={onDismiss} />
      </Modal>

      {/* Modal 7 */}
      <Modal
        visible={activeModal === 'modal7'}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <AppointmentForm onDismiss={onDismiss} />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#393939',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 10,
  },
});

export default Modals;
