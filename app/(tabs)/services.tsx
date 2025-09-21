import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

interface ServiceBooking {
  id: string;
  userId: string;
  serviceType: string;
  serviceName: string;
  scheduledDate: string;
  timeSlot: string;
  address: string;
  contactPhone: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  specialInstructions: string;
  preferredWorker: string;
  cost: string;
  status: 'requested' | 'confirmed' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  requestDate: string;
  assignedWorker?: string;
  completedDate?: string;
  coordinates?: { latitude: number; longitude: number };
}

export default function ServicesScreen() {
  const { theme, isDark } = useTheme();
  const { user } = useData();
  const styles = createStyles(theme);
  
  const [activeTab, setActiveTab] = useState<'services' | 'booking' | 'my-bookings'>('services');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [bookings, setBookings] = useState<ServiceBooking[]>([
    // Sample booking for demonstration
    {
      id: 'SB001',
      userId: user?.id || 'demo-user-id',
      serviceType: 'bulk_pickup',
      serviceName: 'Bulk Waste Pickup',
      scheduledDate: '2025-09-25',
      timeSlot: '10:00 AM - 12:00 PM',
      address: '123 Demo Street, Sample City',
      contactPhone: '+91 9876543210',
      urgency: 'normal',
      specialInstructions: 'Old furniture pickup',
      preferredWorker: 'auto',
      cost: 'Free',
      status: 'scheduled',
      requestDate: '2025-09-21',
      assignedWorker: 'Rajesh Kumar'
    }
  ]);
  
  const [bookingForm, setBookingForm] = useState({
    scheduledDate: '',
    timeSlot: '',
    address: '',
    contactPhone: user?.phone || '',
    urgency: 'normal' as 'normal' | 'urgent' | 'emergency',
    specialInstructions: '',
    preferredWorker: 'auto',
    customRequirements: ''
  });

  // Service types with enhanced details
  const serviceTypes = [
    {
      id: 'bulk_pickup',
      name: 'Bulk Waste Pickup',
      icon: 'car',
      description: 'Large items, furniture, appliances collection',
      duration: '2-3 hours',
      cost: 'Free (up to 3 items)',
      category: 'Collection',
      color: theme.primary,
      features: ['Free pickup', 'Large items', 'Scheduled service']
    },
    {
      id: 'special_collection',
      name: 'Special Waste Collection',
      icon: 'warning',
      description: 'Hazardous materials, electronics, batteries',
      duration: '1-2 hours', 
      cost: '₹50-200',
      category: 'Specialized',
      color: theme.error,
      features: ['Hazardous materials', 'Electronics', 'Safe disposal']
    },
    {
      id: 'garden_waste',
      name: 'Garden Waste Collection',
      icon: 'leaf',
      description: 'Leaves, branches, grass clippings pickup',
      duration: '1 hour',
      cost: 'Free',
      category: 'Garden',
      color: theme.success,
      features: ['Organic waste', 'Garden cleanup', 'Eco-friendly']
    },
    {
      id: 'construction_debris',
      name: 'Construction Debris',
      icon: 'construct',
      description: 'Construction materials, renovation waste',
      duration: '3-4 hours',
      cost: '₹500-1500',
      category: 'Construction',
      color: theme.warning,
      features: ['Heavy materials', 'Large quantities', 'Professional handling']
    },
    {
      id: 'medical_waste',
      name: 'Medical Waste Disposal',
      icon: 'medical',
      description: 'Safe disposal of medical items, syringes',
      duration: '30 minutes',
      cost: '₹100-300',
      category: 'Medical',
      color: '#e11d48',
      features: ['Medical items', 'Safe disposal', 'Certified handling']
    },
    {
      id: 'custom_service',
      name: 'Custom Service Request',
      icon: 'add-circle',
      description: 'Create a personalized service request',
      duration: 'Variable',
      cost: 'Quote on request',
      category: 'Custom',
      color: '#8b5cf6',
      features: ['Personalized', 'Flexible', 'Custom requirements']
    }
  ];

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM', 
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM'
  ];

  const workers = [
    { id: 'auto', name: 'Auto-assign (Recommended)', rating: null },
    { id: 'rajesh', name: 'Rajesh Kumar', rating: 4.8, experience: '5 years' },
    { id: 'priya', name: 'Priya Sharma', rating: 4.9, experience: '3 years' },
    { id: 'amit', name: 'Amit Singh', rating: 4.7, experience: '4 years' }
  ];

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    if (service.id === 'custom_service') {
      setShowCustomForm(true);
    } else {
      setShowBookingModal(true);
    }
  };

  const handleBookingSubmit = () => {
    if (!bookingForm.scheduledDate || !bookingForm.timeSlot || !bookingForm.address) {
      if (Platform.OS === 'web') {
        alert('❌ Please fill in all required fields');
      } else {
        Alert.alert('Error', 'Please fill in all required fields');
      }
      return;
    }

    const newBooking: ServiceBooking = {
      id: `SB${Date.now()}`,
      userId: user?.id || 'demo-user-id',
      serviceType: selectedService.id,
      serviceName: selectedService.name,
      scheduledDate: bookingForm.scheduledDate,
      timeSlot: bookingForm.timeSlot,
      address: bookingForm.address,
      contactPhone: bookingForm.contactPhone,
      urgency: bookingForm.urgency,
      specialInstructions: bookingForm.specialInstructions,
      preferredWorker: bookingForm.preferredWorker,
      cost: selectedService.cost,
      status: 'requested',
      requestDate: new Date().toLocaleDateString(),
    };

    setBookings([...bookings, newBooking]);
    
    if (Platform.OS === 'web') {
      alert(`✅ Service Booked Successfully!\n\n📋 Booking ID: ${newBooking.id}\n🗑️ Service: ${selectedService.name}\n📅 Date: ${bookingForm.scheduledDate}\n⏰ Time: ${bookingForm.timeSlot}\n\n📱 You will receive a confirmation call within 2 hours.`);
    } else {
      Alert.alert(
        'Service Booked Successfully!',
        `Booking ID: ${newBooking.id}\nService: ${selectedService.name}\nDate: ${bookingForm.scheduledDate}\nTime: ${bookingForm.timeSlot}\n\nYou will receive a confirmation call within 2 hours.`
      );
    }

    // Reset form
    setBookingForm({
      scheduledDate: '',
      timeSlot: '',
      address: '',
      contactPhone: user?.phone || '',
      urgency: 'normal',
      specialInstructions: '',
      preferredWorker: 'auto',
      customRequirements: ''
    });
    setShowBookingModal(false);
    setShowCustomForm(false);
    setActiveTab('my-bookings');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return theme.primary;
      case 'confirmed': return theme.success;
      case 'scheduled': return theme.warning;
      case 'in-progress': return theme.warning;
      case 'completed': return theme.success;
      case 'cancelled': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'normal': return theme.success;
      case 'urgent': return theme.warning;
      case 'emergency': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const renderServicesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Available Services</Text>
        <Text style={styles.sectionSubtitle}>Choose the service that matches your needs</Text>
        
        <View style={styles.servicesGrid}>
          {serviceTypes.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, { borderLeftColor: service.color }]}
              onPress={() => handleServiceSelect(service)}
            >
              <View style={styles.serviceHeader}>
                <View style={[styles.serviceIconContainer, { backgroundColor: service.color + '20' }]}>
                  <Ionicons name={service.icon as any} size={32} color={service.color} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceCategory}>{service.category}</Text>
                  <Text style={styles.serviceCost}>{service.cost}</Text>
                </View>
              </View>
              
              <Text style={styles.serviceDescription}>{service.description}</Text>
              
              <View style={styles.serviceFeatures}>
                {service.features.map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureText}>✓ {feature}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.serviceFooter}>
                <View style={styles.durationInfo}>
                  <Ionicons name="time" size={14} color={theme.textSecondary} />
                  <Text style={styles.durationText}>{service.duration}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={service.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderBookingModal = () => (
    <Modal
      visible={showBookingModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBookingModal(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Book {selectedService?.name}</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.selectedServiceCard}>
              <View style={styles.selectedServiceHeader}>
                <Ionicons name={selectedService?.icon} size={24} color={selectedService?.color} />
                <View style={styles.selectedServiceInfo}>
                  <Text style={styles.selectedServiceName}>{selectedService?.name}</Text>
                  <Text style={styles.selectedServiceDetails}>
                    {selectedService?.duration} • {selectedService?.cost}
                  </Text>
                </View>
              </View>
            </View>

            {/* Date Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>📅 Preferred Date *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                value={bookingForm.scheduledDate}
                onChangeText={(value) => setBookingForm({...bookingForm, scheduledDate: value})}
              />
            </View>

            {/* Time Slot */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>⏰ Time Slot *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timeSlotContainer}>
                  {timeSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.timeSlotButton,
                        bookingForm.timeSlot === slot && styles.selectedTimeSlot
                      ]}
                      onPress={() => setBookingForm({...bookingForm, timeSlot: slot})}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        bookingForm.timeSlot === slot && styles.selectedTimeSlotText
                      ]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>📍 Service Address *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Complete address where service is required"
                value={bookingForm.address}
                onChangeText={(value) => setBookingForm({...bookingForm, address: value})}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Contact Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>📞 Contact Phone *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Your contact number"
                value={bookingForm.contactPhone}
                onChangeText={(value) => setBookingForm({...bookingForm, contactPhone: value})}
                keyboardType="phone-pad"
              />
            </View>

            {/* Urgency Level */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>⚡ Urgency Level</Text>
              <View style={styles.urgencyContainer}>
                {[
                  { key: 'normal', label: '🟢 Normal - 3-5 days', color: theme.success },
                  { key: 'urgent', label: '🟡 Urgent - 1-2 days', color: theme.warning },
                  { key: 'emergency', label: '🔴 Emergency - Same day', color: theme.error }
                ].map((urgency) => (
                  <TouchableOpacity
                    key={urgency.key}
                    style={[
                      styles.urgencyOption,
                      bookingForm.urgency === urgency.key && { borderColor: urgency.color, backgroundColor: urgency.color + '20' }
                    ]}
                    onPress={() => setBookingForm({...bookingForm, urgency: urgency.key as any})}
                  >
                    <Text style={[
                      styles.urgencyText,
                      bookingForm.urgency === urgency.key && { color: urgency.color }
                    ]}>
                      {urgency.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Special Instructions */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>📝 Special Instructions</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Any specific instructions, items to be collected, accessibility info, etc."
                value={bookingForm.specialInstructions}
                onChangeText={(value) => setBookingForm({...bookingForm, specialInstructions: value})}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleBookingSubmit}>
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Submit Booking Request</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderCustomFormModal = () => (
    <Modal
      visible={showCustomForm}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCustomForm(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Custom Service Request</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.customFormInfo}>
              <Ionicons name="information-circle" size={24} color={theme.primary} />
              <Text style={styles.customFormText}>
                Describe your specific waste management needs. Our team will review and provide a customized solution.
              </Text>
            </View>

            {/* Custom Requirements */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>📋 Describe Your Requirements *</Text>
              <TextInput
                style={[styles.formInput, styles.largeTextArea]}
                placeholder="Please describe in detail:&#10;• Type of waste/materials&#10;• Quantity/volume&#10;• Location details&#10;• Timeline requirements&#10;• Any special handling needs"
                value={bookingForm.customRequirements}
                onChangeText={(value) => setBookingForm({...bookingForm, customRequirements: value})}
                multiline
                numberOfLines={8}
              />
            </View>

            {/* Contact Information */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>📞 Contact Phone *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Your contact number"
                value={bookingForm.contactPhone}
                onChangeText={(value) => setBookingForm({...bookingForm, contactPhone: value})}
                keyboardType="phone-pad"
              />
            </View>

            {/* Preferred Contact Time */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>⏰ Preferred Contact Time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timeSlotContainer}>
                  {timeSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.timeSlotButton,
                        bookingForm.timeSlot === slot && styles.selectedTimeSlot
                      ]}
                      onPress={() => setBookingForm({...bookingForm, timeSlot: slot})}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        bookingForm.timeSlot === slot && styles.selectedTimeSlotText
                      ]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: '#8b5cf6' }]} 
              onPress={() => {
                if (!bookingForm.customRequirements || !bookingForm.contactPhone) {
                  Alert.alert('Error', 'Please fill in all required fields');
                  return;
                }

                const customBooking: ServiceBooking = {
                  id: `CB${Date.now()}`,
                  userId: user?.id || 'demo-user-id',
                  serviceType: 'custom_service',
                  serviceName: 'Custom Service Request',
                  scheduledDate: 'TBD',
                  timeSlot: bookingForm.timeSlot || 'TBD',
                  address: 'Will be discussed',
                  contactPhone: bookingForm.contactPhone,
                  urgency: 'normal',
                  specialInstructions: bookingForm.customRequirements,
                  preferredWorker: 'auto',
                  cost: 'Quote on request',
                  status: 'requested',
                  requestDate: new Date().toLocaleDateString(),
                };

                setBookings([...bookings, customBooking]);
                
                if (Platform.OS === 'web') {
                  alert(`✅ Custom Request Submitted!\n\n📋 Request ID: ${customBooking.id}\n📞 Our team will call you within 4 hours to discuss your requirements and provide a quote.\n\n📝 Your request has been forwarded to our specialists.`);
                } else {
                  Alert.alert(
                    'Custom Request Submitted!',
                    `Request ID: ${customBooking.id}\n\nOur team will call you within 4 hours to discuss your requirements and provide a quote.`
                  );
                }

                setBookingForm({
                  scheduledDate: '',
                  timeSlot: '',
                  address: '',
                  contactPhone: user?.phone || '',
                  urgency: 'normal',
                  specialInstructions: '',
                  preferredWorker: 'auto',
                  customRequirements: ''
                });
                setShowCustomForm(false);
                setActiveTab('my-bookings');
              }}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Submit Custom Request</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderMyBookingsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.bookingsHeader}>
          <Text style={styles.sectionTitle}>My Service Bookings</Text>
          <TouchableOpacity
            style={styles.newBookingButton}
            onPress={() => setActiveTab('services')}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.newBookingButtonText}>New Booking</Text>
          </TouchableOpacity>
        </View>

        {bookings.filter(b => b.userId === user?.id).length === 0 ? (
          <View style={styles.emptyBookings}>
            <Ionicons name="calendar-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyBookingsTitle}>No Bookings Yet</Text>
            <Text style={styles.emptyBookingsText}>
              Book your first service to get started with professional waste management
            </Text>
            <TouchableOpacity
              style={styles.bookFirstServiceButton}
              onPress={() => setActiveTab('services')}
            >
              <Text style={styles.bookFirstServiceButtonText}>Book First Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bookingsContainer}>
            {bookings
              .filter(booking => booking.userId === user?.id)
              .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
              .map((booking) => (
                <View key={booking.id} style={styles.bookingCard}>
                  <View style={styles.bookingCardHeader}>
                    <View>
                      <Text style={styles.bookingServiceName}>{booking.serviceName}</Text>
                      <Text style={styles.bookingId}>ID: {booking.id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                        {booking.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingDetails}>
                    <View style={styles.bookingDetailRow}>
                      <Ionicons name="calendar" size={16} color={theme.textSecondary} />
                      <Text style={styles.bookingDetailText}>
                        {booking.scheduledDate} • {booking.timeSlot}
                      </Text>
                    </View>
                    
                    <View style={styles.bookingDetailRow}>
                      <Ionicons name="location" size={16} color={theme.textSecondary} />
                      <Text style={styles.bookingDetailText} numberOfLines={2}>
                        {booking.address}
                      </Text>
                    </View>

                    {booking.assignedWorker && (
                      <View style={styles.bookingDetailRow}>
                        <Ionicons name="person" size={16} color={theme.textSecondary} />
                        <Text style={styles.bookingDetailText}>
                          Worker: {booking.assignedWorker}
                        </Text>
                      </View>
                    )}

                    <View style={styles.bookingDetailRow}>
                      <Ionicons name="cash" size={16} color={theme.success} />
                      <Text style={[styles.bookingDetailText, { color: theme.success, fontWeight: '600' }]}>
                        Cost: {booking.cost}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingActions}>
                    <TouchableOpacity style={styles.bookingActionButton}>
                      <Ionicons name="eye" size={16} color={theme.primary} />
                      <Text style={[styles.bookingActionText, { color: theme.primary }]}>
                        View Details
                      </Text>
                    </TouchableOpacity>
                    
                    {booking.status === 'requested' || booking.status === 'confirmed' ? (
                      <TouchableOpacity style={styles.bookingActionButton}>
                        <Ionicons name="close-circle" size={16} color={theme.error} />
                        <Text style={[styles.bookingActionText, { color: theme.error }]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.subtitle}>Professional waste management solutions</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'services' && styles.activeTab]}
          onPress={() => setActiveTab('services')}
        >
          <Ionicons 
            name="construct" 
            size={20} 
            color={activeTab === 'services' ? '#ffffff' : theme.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
            Services
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-bookings' && styles.activeTab]}
          onPress={() => setActiveTab('my-bookings')}
        >
          <Ionicons 
            name="calendar" 
            size={20} 
            color={activeTab === 'my-bookings' ? '#ffffff' : theme.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'my-bookings' && styles.activeTabText]}>
            My Bookings ({bookings.filter(b => b.userId === user?.id).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'services' && renderServicesTab()}
      {activeTab === 'my-bookings' && renderMyBookingsTab()}

      {/* Modals */}
      {renderBookingModal()}
      {renderCustomFormModal()}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.success,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a7f3d0',
    textAlign: 'center',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: theme.success,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderLeftWidth: 5,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 12,
    color: theme.textSecondary,
    backgroundColor: theme.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  serviceCost: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.success,
  },
  serviceDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  serviceFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  featureTag: {
    backgroundColor: theme.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureText: {
    fontSize: 11,
    color: theme.success,
    fontWeight: '500',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  selectedServiceCard: {
    backgroundColor: theme.primary + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  selectedServiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedServiceInfo: {
    marginLeft: 12,
  },
  selectedServiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  selectedServiceDetails: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  largeTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  timeSlotButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedTimeSlot: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  timeSlotText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  selectedTimeSlotText: {
    color: '#ffffff',
  },
  urgencyContainer: {
    gap: 8,
  },
  urgencyOption: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
  },
  urgencyText: {
    fontSize: 14,
    color: theme.text,
  },
  submitButton: {
    backgroundColor: theme.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  customFormInfo: {
    flexDirection: 'row',
    backgroundColor: theme.primary + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  customFormText: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  bookingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  newBookingButton: {
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  newBookingButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyBookingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyBookingsText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 20,
  },
  bookFirstServiceButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookFirstServiceButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  bookingsContainer: {
    gap: 16,
  },
  bookingCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingServiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  bookingId: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bookingDetailText: {
    fontSize: 14,
    color: theme.text,
    flex: 1,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  bookingActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
