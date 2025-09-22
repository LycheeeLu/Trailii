import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/config';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';

const Duration_OPTIONS = [
 { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 150, label: '2.5 hours'},
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 + hours' },
]

const DurationSelector = ({duration, onDurationChange, style}) => {
    // a sliding card with drop down menu
    const [modalVisible, setModalVisible] = useState(false);

    // show 1 hr 30 min or fallbacks like 25min
    const getCurrentDurationLabel = ( ) =>{
        const option = Duration_OPTIONS.find(opt => opt.value === duration);
        return option? option.label : `${duration} min`;
    };


    const handleDurationSelect = (selectedDuration) => {
        // pass selected duration to parent component
        onDurationChange(selectedDuration);
        // after choosing duration, close the modal card
        setModalVisible(false);

    };

    return (
        <>
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={() => setModalVisible(true)}
        >
            <Ionicons name="time-outline"
                size={16}
                color = {COLORS.primary}
            />
            <Text
                style={styles.durationText}>
                    {getCurrentDurationLabel()}
            </Text>
            <Ionicons
                name="chevron-down"
                size={16}
                color={COLORS.white}
            />
        </TouchableOpacity>

        <Modal
            animationType='slide'
            transparent={true}
            visible={modalVisible}
            onRequestClose={()=> setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        Visit Duration
                    </Text>
                    <TouchableOpacity
                        onPress={()=> setModalVisible(false)}
                        styles={styles.closeButton}>
                        <Ionicons name="close"
                            size={24}
                            color={COLORS.gray}
                        />
                    </TouchableOpacity>

                </View>

                <ScrollView style={styles.optionsList}>
                    {Duration_OPTIONS.map((option)=>{
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.option,
                                duration === option.value && styles.selectedOption
                            ]}
                            onPress={() => handleDurationSelect(option.value)}
                        >
                            <Text style={[
                                styles.optionText,
                                duration === option.value && styles.selectedOptionText
                            ]}>
                                {option.label}
                            </Text>
                            {duration === option.value && (
                                <Ionicons name = "checkmark"
                                    size = {20}
                                    color = {COLORS.primary}
                                />
                            )}
                        </TouchableOpacity>
                    })}
                </ScrollView>
            </View>
        </Modal>
        </>
    );

};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    minWidth: 100,
  },
  durationText: {
    fontSize: 14,
    color: COLORS.primary,
    marginHorizontal: 6,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  closeButton: {
    padding: 5,
  },
  optionsList: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedOption: {
    backgroundColor: COLORS.primary + '10',
  },
  optionText: {
    fontSize: 16,
    color: COLORS.black,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default DurationSelector;